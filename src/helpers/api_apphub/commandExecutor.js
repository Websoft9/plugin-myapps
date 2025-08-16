import cockpit from "cockpit";

/**
 * 带超时机制的 cockpit.spawn 执行方法
 * @param {string} script - 要执行的脚本命令
 * @param {number} timeout - 超时时间（毫秒），默认 10000ms
 * @param {object} options - cockpit.spawn 的额外选项，默认 { superuser: "try" }
 * @returns {Promise<string>} - 执行结果
 */
const executeWithTimeout = async (script, timeout = 10000, options = { superuser: "try" }) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("Request timeout"));
        }, timeout);

        cockpit.spawn(["/bin/bash", "-c", script], options)
            .then((result) => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
};

/**
 * 执行 Docker 容器内的命令
 * @param {string} containerName - 容器名称
 * @param {string} command - 要在容器内执行的命令
 * @param {number} timeout - 超时时间（毫秒），默认 15000ms
 * @returns {Promise<string>} - 执行结果
 */
const executeDockerCommand = async (containerName, command, timeout = 15000) => {
    const script = `docker exec -i ${containerName} ${command}`;
    return executeWithTimeout(script, timeout);
};

/**
 * 执行 curl 命令
 * @param {string} url - 请求的 URL
 * @param {object} options - curl 选项
 * @param {string} options.method - HTTP 方法，默认 'GET'
 * @param {object} options.headers - 请求头
 * @param {string} options.data - 请求数据（用于 POST/PUT）
 * @param {number} options.timeout - 超时时间（秒），默认 10
 * @param {number} timeout - 整个操作的超时时间（毫秒），默认 15000ms
 * @returns {Promise<{body: string, statusCode: string}>} - 响应体和状态码
 */
const executeCurlCommand = async (url, options = {}, timeout = 15000) => {
    const {
        method = 'GET',
        headers = {},
        data = null,
        timeout: curlTimeout = 10
    } = options;

    let curlCommand = `curl -s -w "\\n%{http_code}" --connect-timeout ${curlTimeout} --max-time ${curlTimeout}`;

    // 添加 HTTP 方法
    curlCommand += ` -X ${method.toUpperCase()}`;

    // 添加请求头
    Object.entries(headers).forEach(([key, value]) => {
        curlCommand += ` -H "${key}: ${value}"`;
    });

    // 添加请求数据
    if (data && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
        curlCommand += ` -d '${jsonData}'`;
    }

    // 添加 URL
    curlCommand += ` "${url}"`;

    const response = await executeWithTimeout(curlCommand, timeout);

    // 分离响应体和HTTP状态码
    const lines = response.trim().split('\n');
    const statusCode = lines[lines.length - 1];
    const body = lines.slice(0, -1).join('\n');

    return { body, statusCode };
};

/**
 * 获取系统配置的通用方法
 * @param {string} section - 配置节
 * @param {string} key - 配置键（可选）
 * @param {number} timeout - 超时时间（毫秒），默认 10000ms
 * @returns {Promise<string>} - 配置值
 */
const getSystemConfig = async (section, key = null, timeout = 10000) => {
    let command = `apphub getsysconfig --section ${section}`;
    if (key) {
        command += ` --key ${key}`;
    }

    return executeDockerCommand('websoft9-apphub', command, timeout);
};

/**
 * 获取应用配置的通用方法
 * @param {string} section - 配置节
 * @param {string} key - 配置键（可选）
 * @param {number} timeout - 超时时间（毫秒），默认 10000ms
 * @returns {Promise<string>} - 配置值
 */
const getAppConfig = async (section, key = null, timeout = 10000) => {
    let command = `apphub getconfig --section ${section}`;
    if (key) {
        command += ` --key ${key}`;
    }

    return executeDockerCommand('websoft9-apphub', command, timeout);
};

/**
 * 带错误处理的命令执行方法
 * @param {string} script - 要执行的脚本命令
 * @param {number} timeout - 超时时间（毫秒），默认 10000ms
 * @param {function} errorHandler - 错误处理函数，接收 error 参数，返回处理后的错误或默认值
 * @returns {Promise<string>} - 执行结果
 */
const executeWithErrorHandling = async (script, timeout = 10000, errorHandler = null) => {
    try {
        return await executeWithTimeout(script, timeout);
    } catch (error) {
        if (errorHandler && typeof errorHandler === 'function') {
            return errorHandler(error);
        }

        // 默认错误处理逻辑
        const errorText = [error.problem, error.reason, error.message]
            .filter(item => typeof item === 'string')
            .join(' ');

        if (errorText.includes("permission denied")) {
            throw new Error("Your user does not have Docker permissions. Grant Docker permissions to this user by command: sudo usermod -aG docker <username>");
        } else {
            throw new Error(errorText || "Command execution failed");
        }
    }
};

/**
 * 并行执行多个命令
 * @param {Array<{script: string, timeout?: number}>} commands - 命令数组
 * @returns {Promise<Array<string>>} - 执行结果数组
 */
const executeParallel = async (commands) => {
    const promises = commands.map(({ script, timeout = 10000 }) =>
        executeWithTimeout(script, timeout)
    );

    return Promise.all(promises);
};

/**
 * 按顺序执行多个命令
 * @param {Array<{script: string, timeout?: number}>} commands - 命令数组
 * @returns {Promise<Array<string>>} - 执行结果数组
 */
const executeSequentially = async (commands) => {
    const results = [];

    for (const { script, timeout = 10000 } of commands) {
        const result = await executeWithTimeout(script, timeout);
        results.push(result);
    }

    return results;
};

// 导出所有方法
export {
    executeWithTimeout,
    executeDockerCommand,
    executeCurlCommand,
    getSystemConfig,
    getAppConfig,
    executeWithErrorHandling,
    executeParallel,
    executeSequentially
};

// 默认导出主要的执行方法
export default executeWithTimeout;
