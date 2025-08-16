import cockpit from 'cockpit';
import { getNginxConfig, getApiKey, getPhpAppsConfig, getMonitorAppsConfig } from './apiCore';

class ConfigManager {
    constructor() {
        this.config = null;
        this.initializing = false;
        this.initPromise = null;
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟基础缓存
        this.lastConfigChecksum = null; // 用于检测配置变化
    }

    // 计算配置的校验和
    _calculateConfigChecksum(config) {
        const configStr = JSON.stringify({
            phpApps: config.phpApps,
            monitorApps: config.monitorApps,
            nginxPort: config.nginxPort
        });
        return this._simpleHash(configStr);
    }

    // 简单哈希函数
    _simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    async initialize() {
        if (this.config) {
            return this.config;
        }

        if (this.initializing) {
            return this.initPromise;
        }

        this.initializing = true;
        this.initPromise = this._fetchConfig();

        try {
            this.config = await this.initPromise;
            return this.config;
        } finally {
            this.initializing = false;
        }
    }

    async _fetchConfig() {

        try {
            // 先尝试从本地缓存获取（如果最近获取过且未过期）
            const cachedConfig = this._getCachedConfig();
            if (cachedConfig && this._isCacheValid(cachedConfig)) {
                // 检查配置是否发生变化
                const isConfigChanged = await this._checkConfigChanged(cachedConfig.config);
                if (!isConfigChanged) {
                    return cachedConfig.config;
                }
            }

            // 并行获取所有配置
            const [nginxPort, apiKey, phpApps, monitorApps] = await Promise.allSettled([
                getNginxConfig(),
                getApiKey().catch(() => null), // API key 可选，失败时返回 null
                getPhpAppsConfig(),
                getMonitorAppsConfig()
            ]);

            const config = {
                nginxPort: nginxPort.status === 'fulfilled' ? nginxPort.value : 9000,
                apiKey: apiKey.status === 'fulfilled' ? apiKey.value : null,
                phpApps: phpApps.status === 'fulfilled' ? phpApps.value : [],
                monitorApps: monitorApps.status === 'fulfilled' ? monitorApps.value : [],
                baseURL: `${window.location.protocol}//${window.location.hostname}:${nginxPort.status === 'fulfilled' ? nginxPort.value : 9000}`,
                apiURL: `${window.location.protocol}//${window.location.hostname}:${nginxPort.status === 'fulfilled' ? nginxPort.value : 9000}/api`,
                timestamp: Date.now()
            };

            // 计算并保存新的校验和
            this.lastConfigChecksum = this._calculateConfigChecksum(config);

            // 缓存到本地存储
            this._saveToCache(config);

            return config;
        } catch (error) {

            // 尝试使用过期的缓存作为fallback
            const cachedConfig = this._getCachedConfig();
            if (cachedConfig) {
                return cachedConfig.config;
            }

            // 最后的fallback：默认配置
            const defaultConfig = this._getDefaultConfig();
            return defaultConfig;
        }
    }

    // 检查配置是否发生变化
    async _checkConfigChanged(cachedConfig) {
        try {
            // 快速检查：计算当前配置的校验和
            const currentChecksum = this._calculateConfigChecksum(cachedConfig);

            // 如果校验和相同，说明配置未变化
            if (this.lastConfigChecksum === currentChecksum) {
                // 但为了确保准确性，我们还是要偶尔检查实际配置
                const now = Date.now();
                const lastFullCheck = localStorage.getItem('last_full_config_check');
                if (lastFullCheck && (now - parseInt(lastFullCheck)) < 60000) { // 1分钟内不重复全量检查
                    return false;
                }
            }

            // 获取最新配置进行比较
            const [phpApps, monitorApps] = await Promise.allSettled([
                getPhpAppsConfig(),
                getMonitorAppsConfig()
            ]);

            const latestConfig = {
                phpApps: phpApps.status === 'fulfilled' ? phpApps.value : [],
                monitorApps: monitorApps.status === 'fulfilled' ? monitorApps.value : [],
                nginxPort: cachedConfig.nginxPort
            };

            const latestChecksum = this._calculateConfigChecksum(latestConfig);
            localStorage.setItem('last_full_config_check', Date.now().toString());

            return currentChecksum !== latestChecksum;
        } catch (error) {
            console.warn('[ConfigManager] Failed to check config changes:', error);
            return false; // 检查失败时假设配置未变化
        }
    }

    _getCachedConfig() {
        try {
            const cached = localStorage.getItem('websoft9_myapps_config_cache');
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            return null;
        }
    }

    _isCacheValid(cachedData) {
        if (!cachedData || !cachedData.timestamp) {
            return false;
        }
        return (Date.now() - cachedData.timestamp) < this.cacheTimeout;
    }

    _saveToCache(config) {
        try {
            const cacheData = {
                config,
                timestamp: Date.now(),
                checksum: this._calculateConfigChecksum(config)
            };
            localStorage.setItem('websoft9_myapps_config_cache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('[ConfigManager] Failed to save cache:', error);
        }
    }

    _getDefaultConfig() {
        return {
            nginxPort: 9000,
            apiKey: null,
            phpApps: [],
            monitorApps: [],
            baseURL: `${window.location.protocol}//${window.location.hostname}:9000`,
            apiURL: `${window.location.protocol}//${window.location.hostname}:9000/api`,
            timestamp: Date.now()
        };
    }

    getConfig() {
        return this.config || this._getDefaultConfig();
    }

    // 清除缓存（用于调试或强制刷新）
    clearCache() {
        try {
            localStorage.removeItem('websoft9_myapps_config_cache');
            this.config = null;
            this.initializing = false;
            this.initPromise = null;
        } catch (error) {
            console.warn('[ConfigManager] Failed to clear cache:', error);
        }
    }

    // 预加载配置（可选，用于进一步优化首次加载）
    async preload() {
        if (!this.config && !this.initializing) {
            // 后台预加载，不阻塞UI
            this.initialize().catch(error => {
                console.warn('[ConfigManager] Preload failed:', error);
            });
        }
    }

    // 获取配置的简化方法
    async getBaseURL() {
        const config = await this.initialize();
        return config.baseURL;
    }

    async getApiURL() {
        const config = await this.initialize();
        return config.apiURL;
    }

    async getNginxPort() {
        const config = await this.initialize();
        return config.nginxPort;
    }

    async getApiKey() {
        const config = await this.initialize();
        return config.apiKey;
    }

    // 新增获取PHP应用列表的方法
    async getPhpApps() {
        const config = await this.initialize();
        return config.phpApps || [];
    }

    // 新增获取监控应用列表的方法
    async getMonitorApps() {
        const config = await this.initialize();
        return config.monitorApps || [];
    }

    // 检查配置是否可用
    isConfigAvailable() {
        const config = this.getConfig();
        return !!(config.nginxPort && config.apiKey);
    }

    // 强制刷新配置
    async refresh() {
        this.clearCache();
        return this.initialize();
    }
}

// 单例实例
const configManager = new ConfigManager();

// 开发环境下暴露到全局，方便调试
if (process.env.NODE_ENV === 'development') {
    window.configManager = configManager;
}

export default configManager;
