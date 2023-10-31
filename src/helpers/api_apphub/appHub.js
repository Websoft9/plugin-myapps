import { APICore } from './apiCore';

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



//删除APP绑定的域名
function AppDomainDelete(params: any): Promise<any> {
    const baseUrl = '/AppDomainDelete';
    return api.get(`${baseUrl}`, params);
}

//修改APP绑定的域名
function AppDomainUpdate(params: any): Promise<any> {
    const baseUrl = '/AppDomainUpdate';
    return api.get(`${baseUrl}`, params);
}

//APP绑定域名
function AppDomainAdd(params: any): Promise<any> {
    const baseUrl = '/AppDomainAdd';
    return api.get(`${baseUrl}`, params);
}

//设定默认域名
function AppDomainSet(params: any): Promise<any> {
    const baseUrl = '/AppDomainSet';
    return api.get(`${baseUrl}`, params);
}

//获取插件登录数据
function AppSearchUsers(params: any): Promise<any> {
    const baseUrl = '/AppSearchUsers';
    return api.get(`${baseUrl}`, params);
}

export {
    AppDomainAdd, AppDomainDelete, AppDomainList, AppDomainSet, AppDomainUpdate,
    AppSearchUsers, Apps, RedeployApp, RemoveApp, RestartApp, StartApp, StopApp, UninstallApp
};


