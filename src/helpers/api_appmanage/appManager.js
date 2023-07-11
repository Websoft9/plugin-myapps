import { APICore } from './apiCore';

const api = new APICore();

//App 列表查询
function AppList(params: any): Promise<any> {
    const baseUrl = '/AppList';
    return api.get(`${baseUrl}`, params);
}

//App 卸载
function AppUninstall(params: any): Promise<any> {
    const baseUrl = '/AppUninstall';
    return api.get(`${baseUrl}`, params);
}

//App 停止
function AppStop(params: any): Promise<any> {
    const baseUrl = '/AppStop';
    return api.get(`${baseUrl}`, params);
}

//App 启动
function AppStart(params: any): Promise<any> {
    const baseUrl = '/AppStart';
    return api.get(`${baseUrl}`, params);
}

//App 重启
function AppRestart(params: any): Promise<any> {
    const baseUrl = '/AppRestart';
    return api.get(`${baseUrl}`, params);
}

//App 状态查询
function AppStatus(params: any): Promise<any> {
    const baseUrl = '/AppStatus';
    return api.get(`${baseUrl}`, params);
}

//查询APP对应的域名
function AppDomainList(params: any): Promise<any> {
    const baseUrl = '/AppDomainList';
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

export { AppDomainAdd, AppDomainDelete, AppDomainList, AppDomainSet, AppDomainUpdate, AppList, AppRestart, AppSearchUsers, AppStart, AppStatus, AppStop, AppUninstall };


