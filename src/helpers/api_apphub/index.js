// @flow
import {
    AppDomainCreateByAppID,
    AppDomainDeleteByProxyID,
    AppDomainList,
    AppDomainUpdateByProxyID,
    Apps,
    RedeployApp,
    RemoveApp,
    RemoveErrorApp,
    RestartApp,
    StartApp,
    StopApp,
    UninstallApp,
    resetApiInstance
} from './appHub';

// 导入新的 API 核心功能
export { APICore, getNginxConfig, getApiKey, configManager } from './apiCore';
export { default as ConfigManager } from './configManager';

// 导入命令执行器相关功能
export {
    executeWithTimeout,
    executeDockerCommand,
    executeCurlCommand,
    getSystemConfig,
    getAppConfig,
    executeWithErrorHandling,
    executeParallel,
    executeSequentially
} from './commandExecutor';

// 导出原有的应用相关 API
export {
    AppDomainCreateByAppID,
    AppDomainDeleteByProxyID,
    AppDomainList,
    AppDomainUpdateByProxyID,
    Apps,
    RedeployApp,
    RemoveApp,
    RemoveErrorApp,
    RestartApp,
    StartApp,
    StopApp,
    UninstallApp,
    resetApiInstance
};

// 推荐的使用方式：
// import { configManager, APICore, Apps, executeWithTimeout } from './api_apphub';
// 或者
// import { APICore, configManager, executeDockerCommand } from './api_apphub';
// 或者
// import executeWithTimeout from './api_apphub/commandExecutor';

