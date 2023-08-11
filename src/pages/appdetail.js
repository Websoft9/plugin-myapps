import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import classnames from "classnames";
import cockpit from 'cockpit';
import jwt_decode from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Modal, Nav, OverlayTrigger, Row, Tab, Tooltip } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import DefaultImg from '../assets/images/default.png';
import Spinner from '../components/Spinner';
import { AppRestart, AppSearchUsers, AppStart, AppStop } from '../helpers';
import AppAccess from './appdetailtabs/appaccess';
import AppContainer from './appdetailtabs/appcontainer';
import AppOverview from './appdetailtabs/appoverview';
import Uninstall from './appdetailtabs/appuninstall';
//import AppTerminal from './myterminal';
//import AppTerminal from './appdetailtabs/appterminal';

const _ = cockpit.gettext;

const MyMuiAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AppDetailModal = (props): React$Element<React$FragmentType> => {
    const [restartDisable, setRestartDisable] = useState(false);//用于重启按钮的按钮禁用
    const [buttonDisable, setButtonDisable] = useState(false); //用于启动/停止按钮禁用
    const [currentApp, setCurrentApp] = useState(props.current_app);
    const [startAppLoading, setStartAppLoading] = useState(false); //用户显示启动应用的加载状态
    const [stopAppLoading, setStopAppLoading] = useState(false); //用户显示停止时应用的加载状态
    const [restartAppLoading, setRestartAppLoading] = useState(false); //用户显示重启时应用的加载状态
    const navigate = useNavigate(); //用于页面跳转
    const childRef = useRef();
    const [containersInfo, setContainersInfo] = useState([]);
    const customer_name = props?.current_app?.customer_name;
    const [endpointsId, setEndpointsId] = useState(null);
    const [mainContainerId, setMainContainerId] = useState(null);
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [alertType, setAlertType] = useState("");  //用于确定弹窗的类型：error\success

    const protocol = window.location.protocol;
    const host = window.location.host;
    const baseURL = protocol + "//" + (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(host) ? host.split(":")[0] : host);
    //let portainerjwt = window.localStorage.getItem("portainer.JWT"); //获取存储在本地的JWT数据 
    let portainerjwt = window.sessionStorage.getItem("portainerJWT"); //获取存储在本地的JWT数据 

    function isTokenExpired(token) {
        const decodedToken = jwt_decode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp < currentTime;
    }

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    const getJwt = async () => {
        var response = await AppSearchUsers({ "plugin_name": "portainer" });
        response = JSON.parse(response);
        if (response.Error) {
            throw new Error("Request portainer user info failed.");
        }
        else {
            var authResponse = await axios.post(baseURL + "/portainer/api/auth", {
                username: response.ResponseData.user?.user_name,
                password: response.ResponseData.user?.password
            })
            if (authResponse.status === 200) {
                //portainerjwt = "\"" + authResponse.data.jwt + "\"";
                portainerjwt = authResponse.data.jwt;
                //window.localStorage.setItem('portainer\.JWT', portainerjwt);
                window.sessionStorage.setItem('portainerJWT', portainerjwt);
            } else {
                throw new Error("Request portainer tokens failed.");
            }
        }
    }

    //通过Portainer的接口获取容器数据
    const getContainersData = async () => {
        try {
            var id = null;

            //如果获取不到jwt，则模拟登录并写入新的jwt
            if (!portainerjwt) {
                await getJwt();
            }
            else {
                const isExpired = isTokenExpired(portainerjwt);
                if (isExpired) { //如果已经过期，重新生成JWT
                    await getJwt();
                }
            }

            //从portainer接口获取endpoints
            const endpointsData = await axios.get(baseURL + '/portainer/api/endpoints', {
                headers: {
                    'Authorization': 'Bearer ' + portainerjwt
                }
            })
            if (endpointsData.status === 200) {
                //先判断是否获取了“本地”endpoint
                if (endpointsData.data.length == 0) { //没有“本地”endpoint
                    //调用添加"本地"环境的接口
                    const addEndpoint = await axios.post(baseURL + '/portainer/api/endpoints', {},
                        {
                            params: {
                                Name: "local",
                                EndpointCreationType: 1
                            },
                            headers: {
                                'Authorization': 'Bearer ' + portainerjwt
                            }
                        }
                    )
                    if (addEndpoint.status === 200) {
                        id = addEndpoint.data?.Id;
                        setEndpointsId(id);
                    }
                    else {
                        throw new Error("Request portainer addEndpoint failed.");
                    }
                }
                else {
                    //应该可能会返回“远程”的endpoint，这里只获取“本地”endpoint,条件为URL包含'/var/run/docker.sock'
                    id = endpointsData.data.find(({ URL }) => URL.includes('/var/run/docker.sock')).Id;
                    setEndpointsId(id);
                }
                //调用Portainer接口获取容器数据
                const containersData = await axios.get(baseURL + `/portainer/api/endpoints/${id}/docker/containers/json`, {
                    headers: {
                        'Authorization': 'Bearer ' + portainerjwt
                    },
                    params: {
                        all: true,
                        filters: JSON.stringify({ "label": [`com.docker.compose.project=${customer_name}`] })
                    }
                })
                if (containersData.status === 200) {
                    const data = containersData.data;
                    const containerId = data.find(container => container.Names?.[0]?.replace(/^\/|\/$/g, '') === customer_name)?.Id;
                    setMainContainerId(containerId);
                    setContainersInfo(data);
                }
                else {
                    throw new Error("Request portainer containersData failed.");
                }
            }
            else {
                throw new Error("Request portainer endpointsData failed.");
            }
        }
        catch (error) {
            setShowAlert(true);
            setAlertType("error")
            setAlertMessage(error);
        }
    }

    //设置卸载页面的按钮禁用
    const setUninstallButtonDisable = () => {
        // 通过ref调用子组件的方法
        childRef.current.setButtonDisable();
    };

    //设置卸载页面的按钮启用
    const setUninstallButtonEnable = () => {
        // 通过ref调用子组件的方法
        childRef.current.setButtonEnable();
    };

    //设置启动/停止按钮禁用,用于传递给卸载页面
    const setAppdetailButtonDisable = () => {
        setButtonDisable(true);
        setRestartDisable(true);
    };
    //设置启动/停止按钮启用,用于传递给卸载页面
    const setAppdetailButtonEnable = () => {
        setButtonDisable(false);
        setRestartDisable(false);
    };

    useEffect(() => {
        setCurrentApp(props.current_app);
    }, [props.current_app]);

    useEffect(() => {
        getContainersData();
    }, []);

    const tabContents = [
        {
            id: '1',
            title: _("Overview"),
            icon: 'mdi dripicons-home',
            text: <AppOverview data={currentApp} />,
        },
        {
            id: '2',
            title: _("Access"),
            icon: 'mdi dripicons-web',
            text: <AppAccess data={currentApp} />,
        },
        {
            id: '3',
            title: _("Container"),
            icon: 'mdi dripicons-stack',
            text: <AppContainer customer_name={customer_name} endpointsId={endpointsId} containersInfo={containersInfo} />,
        },
        {
            id: '4',
            title: _("Uninstall"),
            icon: 'mdi mdi-cog-outline',
            text: <Uninstall data={currentApp} ref={childRef} disabledButton={setAppdetailButtonDisable} enableButton={setAppdetailButtonEnable}
                onDataChange={props.onDataChange} onCloseFatherModal={props.onClose} />,
        },
    ];

    return (
        <>
            <Modal show={props.showFlag} backdrop="static" onHide={props.onClose} size="lg" scrollable="true" dialogClassName="modal-full-width" >
                <Modal.Header onHide={props.onClose} closeButton>
                    <div style={{ padding: "10px", display: "flex", width: "100%", alignItems: "center" }}>
                        <div className='appstore-item-content-icon col-same-height'>
                            <img
                                src={`./static/logos/${currentApp.app_name}-websoft9.png`}
                                alt={currentApp.app_name}
                                className="app-icon"
                                onError={(e) => (e.target.src = DefaultImg)}
                            />
                        </div>
                        <div className='col-same-height'>
                            <h4 className="appstore-item-content-title" style={{ marginTop: "5px" }}>
                                {currentApp.customer_name}
                            </h4>
                            <h5 className="appstore-item-content-title" style={{ marginTop: "5px" }}>
                                {currentApp.status}
                            </h5>
                        </div>
                        <div className='col-same-height' style={{ flexGrow: 1, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                            {
                                currentApp.status === "exited" &&
                                <OverlayTrigger
                                    key="bottom1"
                                    placement="bottom"
                                    overlay={
                                        <Tooltip id="tooltip-bottom">
                                            {_("Start App")}
                                        </Tooltip>
                                    }>
                                    <Button variant="primary" disabled={buttonDisable}
                                        style={{ padding: "5px 10px", borderRadius: "3px", marginRight: "10px" }}
                                        onClick={async () => {
                                            setUninstallButtonDisable();
                                            setStartAppLoading(true);
                                            setRestartDisable(true);
                                            try {
                                                let response = await AppStart({ app_id: currentApp.app_id });
                                                response = JSON.parse(response);
                                                if (response.Error) {
                                                    navigate("/error")
                                                }
                                                else {
                                                    props.onDataChange();
                                                    getContainersData(); //刷新容器数据
                                                }
                                            }
                                            catch (error) {
                                                navigate("/error-500");
                                            }
                                            finally {
                                                setUninstallButtonEnable();
                                                setStartAppLoading(false);
                                                setRestartDisable(false);
                                            }
                                        }}
                                    >
                                        {
                                            startAppLoading ?
                                                <Spinner className="spinner-border-sm noti-icon" color="light" />
                                                :
                                                <i className="dripicons-media-play noti-icon"></i>
                                        }
                                    </Button>
                                </OverlayTrigger>
                            }
                            {
                                currentApp.status === "running" &&
                                <OverlayTrigger
                                    key="bottom2"
                                    placement="bottom"
                                    overlay={
                                        <Tooltip id="tooltip-bottom">
                                            {_("Stop App")}
                                        </Tooltip>
                                    }>
                                    <Button variant="primary" disabled={buttonDisable}
                                        style={{ padding: "5px 10px", borderRadius: "3px", marginRight: "10px" }}
                                        onClick={async () => {
                                            setUninstallButtonDisable();
                                            setStopAppLoading(true);
                                            setRestartDisable(true);
                                            try {
                                                let response = await AppStop({ app_id: currentApp.app_id });
                                                response = JSON.parse(response);
                                                if (response.Error) {
                                                    navigate("/error");
                                                }
                                                else {
                                                    props.onDataChange();
                                                    getContainersData(); //刷新容器数据
                                                }
                                            }
                                            catch (error) {
                                                navigate("/error-500");
                                            }
                                            finally {
                                                setUninstallButtonEnable();
                                                setStopAppLoading(false);
                                                setRestartDisable(false);
                                            }
                                        }}
                                    >
                                        {
                                            stopAppLoading ?
                                                <Spinner className="spinner-border-sm noti-icon" color="light" />
                                                :
                                                <i className="dripicons-power noti-icon"></i>
                                        }
                                    </Button>
                                </OverlayTrigger>
                            }
                            <OverlayTrigger
                                key="bottom3"
                                placement="bottom"
                                overlay={
                                    <Tooltip id="tooltip-bottom">
                                        {_("Restart App")}
                                    </Tooltip>
                                }>
                                <Button disabled={restartDisable}
                                    style={{ padding: "5px 10px", borderRadius: "3px", marginRight: "10px" }}
                                    onClick={async () => {
                                        try {
                                            setUninstallButtonDisable();
                                            setRestartAppLoading(true);
                                            setButtonDisable(true);
                                            let response = await AppRestart({ app_id: currentApp.app_id });
                                            response = JSON.parse(response);
                                            if (response.Error) {
                                                navigate("/error");
                                            }
                                            else {
                                                props.onDataChange();
                                                getContainersData(); //刷新容器数据
                                            }
                                        }
                                        catch (error) {
                                            navigate("/error-500");
                                        }
                                        finally {
                                            setUninstallButtonEnable();
                                            setRestartAppLoading(false);
                                            setButtonDisable(false);
                                        }
                                    }}
                                >
                                    {
                                        restartAppLoading ?
                                            <Spinner className="spinner-border-sm noti-icon" color="light" />
                                            :
                                            <i className="dripicons-clockwise noti-icon"></i>
                                    }
                                </Button>
                            </OverlayTrigger>
                            {/* {
                            currentApp.status === "running" &&
                            <OverlayTrigger
                                key="bottom4"
                                placement="bottom"
                                overlay={
                                    <Tooltip id="tooltip-bottom">
                                        {_("Terminal")}
                                    </Tooltip>
                                }>
                                <Link to={{ pathname: '/terminal', search: `?id=${currentApp.customer_name}` }}
                                    style={{ color: "#fff", backgroundColor: "#727cf5", padding: "5px 10px", borderRadius: "3px", borderColor: "#727cf5", marginRight: "10px" }}
                                    target="_blank">
                                    <i className="dripicons-code noti-icon"></i>{' '}
                                </Link>
                            </OverlayTrigger>
                        } */}
                            {
                                <OverlayTrigger
                                    key="bottom5"
                                    placement="bottom"
                                    overlay={
                                        <Tooltip id="tooltip-bottom">
                                            {_("Documentation")}
                                        </Tooltip>
                                    }>
                                    <a href={'https://support.websoft9.com/docs/' + currentApp.app_name}
                                        style={{ color: "#fff", backgroundColor: "#727cf5", padding: "5px 10px", borderRadius: "3px", borderColor: "#727cf5", marginRight: "10px" }}
                                        target="_blank">
                                        <i className="dripicons-document noti-icon"></i>{' '}
                                    </a>
                                </OverlayTrigger>
                            }
                        </div>
                    </div>
                </Modal.Header>
                <Modal.Body className="row">
                    <Tab.Container defaultActiveKey={_("Overview")}>
                        <Col sm={2} className="mb-2 mb-sm-0">
                            <Nav variant="pills" className="flex-column">
                                {tabContents.map((tab, index) => {
                                    return (
                                        <Nav.Item key={index}>
                                            <Nav.Link as={Link} to="#" eventKey={tab.title}>
                                                <i
                                                    className={classnames(
                                                        tab.icon,
                                                        'd-md-none',
                                                        'd-block',
                                                        'me-1'
                                                    )}></i>
                                                <span className="d-none d-md-block">{tab.title}</span>
                                            </Nav.Link>
                                        </Nav.Item>
                                    );
                                })}
                            </Nav>
                        </Col>
                        <Col sm={10}>
                            <Tab.Content style={{ height: "100%" }}>
                                {
                                    tabContents.map((tab, index) => {
                                        return (
                                            <Tab.Pane eventKey={tab.title} id={tab.id} key={index} style={{ height: "100%" }}>
                                                <Row style={{ height: "100%" }}>
                                                    <Col sm="12" >
                                                        {tab.text}
                                                    </Col>
                                                </Row>
                                            </Tab.Pane>
                                        );
                                    })
                                }
                            </Tab.Content>
                        </Col>
                    </Tab.Container>
                    {/* {
                        showAlert &&
                        <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleAlertClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                            <MyMuiAlert onClose={handleAlertClose} severity={alertType} sx={{ width: '100%' }}>
                                {alertMessage}
                            </MyMuiAlert>
                        </Snackbar>
                    } */}
                </Modal.Body>
            </Modal>
        </>
    );
}

export default AppDetailModal;