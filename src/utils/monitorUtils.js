import { executeWithTimeout, executeCurlCommand, getSystemConfig } from '../helpers/api_apphub';

// 系统配置常量（默认值）
const DEFAULT_CONFIG = {
    API_BASE_URL_TEMPLATE: "http://example.com", // 默认监控API地址
    METADATA_BASE_URL: "100.100.100.200",
    REQUEST_TIMEOUT: 15000,
};

// 动态配置对象
let CONFIG = { ...DEFAULT_CONFIG };

// 配置服务类
class ConfigService {
    // 获取websoft9配置
    async getWebsoft9Config() {
        try {
            // 使用封装的命令执行器获取webhook配置
            const response = await getSystemConfig('webhook');

            // 尝试解析JSON响应
            let configData;
            try {
                configData = JSON.parse(response);
            } catch (parseError) {
                console.warn("Failed to parse config response as JSON:", parseError);
                return DEFAULT_CONFIG;
            }

            // 构建新的配置对象
            const newConfig = { ...DEFAULT_CONFIG };

            // 从webhook配置中获取monitor_api地址
            if (configData.monitor_api) {
                newConfig.API_BASE_URL_TEMPLATE = configData.monitor_api;
                console.log("Monitor API URL loaded from config:", configData.monitor_api);
            } else {
                console.warn("monitor_api not found in webhook config, using default");
            }

            return newConfig;
        } catch (error) {
            console.warn("Failed to get websoft9 config, using defaults:", error);
            return DEFAULT_CONFIG;
        }
    }

    // 初始化配置
    async initializeConfig() {
        try {
            const newConfig = await this.getWebsoft9Config();
            CONFIG = newConfig;
            return CONFIG;
        } catch (error) {
            console.warn("Failed to initialize config, using defaults:", error);
            CONFIG = { ...DEFAULT_CONFIG };
            return CONFIG;
        }
    }
}

// 监控API调用工具类
class MonitorAPI {
    // 生成动态API URL
    async getApiUrl() {
        // 直接返回配置中的API地址，不再需要动态拼接地域
        return CONFIG.API_BASE_URL_TEMPLATE;
    }

    // 发送HTTP请求的通用方法
    async request(method, path, data) {
        try {
            const apiUrl = await this.getApiUrl();
            const url = `${apiUrl}${path}`;

            // 使用封装的 curl 命令执行器
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: CONFIG.REQUEST_TIMEOUT / 1000 // 转换为秒
            };

            if (data && (method === 'POST' || method === 'PUT')) {
                options.data = data;
            }

            const { body, statusCode } = await executeCurlCommand(url, options, CONFIG.REQUEST_TIMEOUT);

            // 检查HTTP状态码
            if (statusCode === '404') {
                throw new Error('404 Not Found - Resource not found');
            } else if (statusCode.startsWith('4') || statusCode.startsWith('5')) {
                throw new Error(`HTTP ${statusCode} - Request failed`);
            }

            // 解析JSON响应
            if (body) {
                try {
                    return JSON.parse(body);
                } catch (parseError) {
                    throw new Error(`Invalid JSON response: ${body}`);
                }
            } else {
                // 对于DELETE请求，可能没有响应体
                return {};
            }
        } catch (error) {
            // 只在非404错误时输出到控制台，避免正常的404查询被当作错误
            if (!error.message || !error.message.includes('404')) {
                console.error("API request failed:", error);
            }
            throw error;
        }
    }

    // 启用监控
    async enableMonitoring(id, domain, email, lang) {
        return this.request("POST", "/v1/monitor", {
            id: id,
            domain: domain,
            email: email,
            lang: lang
        });
    }

    // 更新监控配置
    async updateMonitoring(id, domain, email, lang) {
        return this.request("PUT", `/v1/monitor/${id}`, {
            domain: domain,
            email: email,
            lang: lang
        });
    }

    // 查询监控状态
    async getMonitorStatus(id) {
        return this.request("GET", `/v1/monitor/${id}`);
    }

    // 禁用监控
    async disableMonitoring(id) {
        return this.request("DELETE", `/v1/monitor/${id}`);
    }
}

// 元数据获取工具类
class MetadataService {
    // 使用封装的命令执行器获取元数据的通用方法
    async getMetadata(path) {
        try {
            const url = `http://${CONFIG.METADATA_BASE_URL}${path}`;
            const options = {
                method: 'GET',
                timeout: 6 // 6秒超时
            };

            const { body } = await executeCurlCommand(url, options, 10000);
            return body.trim();
        } catch (error) {
            console.error(`Failed to get metadata from ${path}:`, error);
            throw error;
        }
    }

    // 获取实例ID
    async getInstanceId() {
        return this.getMetadata("/latest/meta-data/instance-id");
    }

    // 获取区域ID
    async getRegionId() {
        return this.getMetadata("/latest/meta-data/region-id");
    }
}

// 创建全局实例
const configService = new ConfigService();
const monitorAPI = new MonitorAPI();
const metadataService = new MetadataService();

// 导出一个简化的函数用于检查和禁用监控
export const checkAndDisableMonitoring = async (appId) => {
    try {
        // 获取实例ID和应用ID构建监控ID
        const instanceId = await metadataService.getInstanceId();
        const monitorId = `${instanceId}_${appId}`;

        // 首先检查监控是否启用
        const monitorStatus = await monitorAPI.getMonitorStatus(monitorId);

        // 如果监控已启用，则禁用它
        if (monitorStatus && monitorStatus.domain && monitorStatus.email) {
            console.log(`Disabling monitoring for app ${appId}...`);
            await monitorAPI.disableMonitoring(monitorId);
            console.log(`Monitoring disabled successfully for app ${appId}`);
            return true; // 返回true表示成功禁用了监控
        }
        return false; // 返回false表示监控本来就没有启用
    } catch (error) {
        // 如果是404错误，说明监控本来就没有启用，这是正常情况
        if (error.message && (error.message.includes('404') || error.message.includes('Not Found'))) {
            console.log(`No monitoring found for app ${appId}, skipping disable step`);
            return false;
        } else {
            // 其他错误记录但不阻断卸载流程
            console.warn(`Failed to disable monitoring for app ${appId}:`, error.message || error);
            throw error; // 抛出错误以便调用者处理
        }
    }
};

// 检查被删除的域名是否正在被监控，如果是则禁用监控
export const checkAndDisableMonitoringForDeletedDomains = async (appId, deletedDomains) => {
    try {
        // 获取实例ID和应用ID构建监控ID
        const instanceId = await metadataService.getInstanceId();
        const monitorId = `${instanceId}_${appId}`;

        // 首先检查监控是否启用
        const monitorStatus = await monitorAPI.getMonitorStatus(monitorId);

        // 如果监控已启用，检查被监控的域名是否在删除列表中
        if (monitorStatus && monitorStatus.domain && monitorStatus.email) {
            const monitoredDomain = monitorStatus.domain;

            // 检查被监控的域名是否在要删除的域名列表中
            const isDomainBeingDeleted = deletedDomains.some(domain => {
                return monitoredDomain.includes(domain) ||
                    monitoredDomain === `http://${domain}` ||
                    monitoredDomain === `https://${domain}`;
            });

            if (isDomainBeingDeleted) {
                console.log(`Monitored domain is being deleted, disabling monitoring for app ${appId}...`);
                await monitorAPI.disableMonitoring(monitorId);
                console.log(`Monitoring disabled successfully for app ${appId} due to domain deletion`);
                return true;
            } else {
                console.log(`Monitored domain ${monitoredDomain} is not being deleted, keeping monitoring enabled`);
                return false;
            }
        }
        return false; // 监控未启用
    } catch (error) {
        // 如果是404错误，说明监控本来就没有启用，这是正常情况
        if (error.message && (error.message.includes('404') || error.message.includes('Not Found'))) {
            console.log(`No monitoring found for app ${appId}, skipping disable step`);
            return false;
        } else {
            // 其他错误记录但不阻断域名删除流程
            console.warn(`Failed to check/disable monitoring for app ${appId}:`, error.message || error);
            throw error; // 抛出错误以便调用者处理
        }
    }
};

// 导出API实例，供其他组件使用
export { monitorAPI, metadataService, configService };
