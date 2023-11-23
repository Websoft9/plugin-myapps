// import { APICore } from './apiCore';
import { APICore } from "./apiCore_axios";

const api = new APICore();

//App 列表查询
function Apps(params: any): Promise<any> {
    const baseUrl = '/apps';
    return api.get(`${baseUrl}`, params);
}

//移除App(状态为：Inactive)
function RemoveApp(app_id: string, params: any): Promise<any> {
    const baseUrl = `/apps/${app_id}/remove`;
    return api.delete(`${baseUrl}`, params);
}

//移除安装错误的App
function RemoveErrorApp(app_id: string, params: any): Promise<any> {
    const baseUrl = `/apps/${app_id}/error/remove`;
    return api.delete(`${baseUrl}`, params);
}


//重建App(状态为：Inactive)
function RedeployApp(app_id: string, params: any): Promise<any> {
    const baseUrl = `/apps/${app_id}/redeploy`;
    return api.put(`${baseUrl}`, params);
}

//App 卸载
function UninstallApp(app_id: string, params: any): Promise<any> {
    const baseUrl = `/apps/${app_id}/uninstall`;
    return api.delete(`${baseUrl}`, params);
}

//App 停止
function StopApp(app_id: string, params: any): Promise<any> {
    const baseUrl = `/apps/${app_id}/stop`;
    return api.post(`${baseUrl}`, params);
}

//App 启动
function StartApp(app_id: string, params: any): Promise<any> {
    const baseUrl = `/apps/${app_id}/start`;
    return api.post(`${baseUrl}`, params);
}

//App 重启
function RestartApp(app_id: string, params: any): Promise<any> {
    const baseUrl = `/apps/${app_id}/restart`;
    return api.post(`${baseUrl}`, params);
}

//查询APP对应的域名
function AppDomainList(app_id: string, params: any): Promise<any> {
    const baseUrl = `/proxys/${app_id}`;
    return api.get(`${baseUrl}`, params);
}

//根据ProxyID删除域名
function AppDomainDeleteByProxyID(proxy_id: string, params: any): Promise<any> {
    const baseUrl = `/proxys/${proxy_id}`;
    return api.delete(`${baseUrl}`, params);
}

//根据ProxyID更新域名
function AppDomainUpdateByProxyID(proxy_id: string, params: any, body: any): Promise<any> {
    const baseUrl = `/proxys/${proxy_id}`;
    return api.put(`${baseUrl}`, params, body);
}

//根据app_id创建域名
function AppDomainCreateByAppID(app_id: string, params: any, body: any): Promise<any> {
    const baseUrl = `/proxys/${app_id}`;
    return api.post(`${baseUrl}`, params, body);
}


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
    UninstallApp
};

