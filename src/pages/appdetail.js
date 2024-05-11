import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import classNames from 'classnames';
import cockpit from 'cockpit';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, Modal, Nav, OverlayTrigger, Row, Tab, Tooltip } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import DefaultImgEn from '../assets/images/default_en.png';
import DefaultImgzh from '../assets/images/default_zh.png';
import Spinner from '../components/Spinner';
import { RedeployApp, RestartApp, StartApp, StopApp } from '../helpers';
import AppAccess from './appdetailtabs/appaccess';
import AppCompose from './appdetailtabs/appcompose';
import AppContainer from './appdetailtabs/appcontainer';
import AppDatabases from './appdetailtabs/appdatabases';
import AppOverview from './appdetailtabs/appoverview';
import Uninstall from './appdetailtabs/appuninstall';
import AppVolume from './appdetailtabs/appvolume';

const _ = cockpit.gettext;
const language = cockpit.language;//获取cockpit的当前语言环境
const DefaultImg = language === "zh_CN" ? DefaultImgzh : DefaultImgEn;
// var baseURL = "";

const MyMuiAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

//重建应用弹窗
const RedeployAppConform = (props): React$Element<React$FragmentType> => {
    const navigate = useNavigate(); //用于页面跳转
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [pullImage, setPullImage] = useState(false); //重建时是否重新拉取镜像
    const [showCloseButton, setShowCloseButton] = useState(true);//用于是否显示关闭按钮

    function closeAllModals() {
        //关闭所有弹窗
        // props.onClose();
        // props.onDataChange();
        window.location.reload(true);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    return (
        <>
            <Modal show={props.showConform} onHide={props.onClose} size="lg"
                scrollable="true" backdrop="static" style={{ backgroundColor: "rgba(0,0,0,0.8)" }}>
                <Modal.Header onHide={props.onClose} className={classNames('modal-colored-header', 'bg-warning')}>
                    <h4>{_("Redeploy")} {props.app.app_id}</h4>
                </Modal.Header>
                <Modal.Body className="row" >
                    <span style={{ margin: "10px 0px" }}>{_("This will be applied through local warehouse reconstruction. If the warehouse does not exist or there are errors in the warehouse file, the reconstruction will fail.")}</span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold", marginRight: "10px" }}>{_("Re-pull image and redeploy:")}</span>
                        < Form >
                            <Form.Check
                                type="switch"
                                id="custom-switch"
                                checked={pullImage}
                                onChange={() => setPullImage(!pullImage)}
                            />
                        </Form>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {
                        showCloseButton && (
                            <Button variant="light" onClick={props.onClose}>
                                {_("Close")}
                            </Button>
                        )
                    }
                    {" "}
                    <Button disabled={disable} variant="warning" onClick={async () => {
                        setDisable(true);
                        setShowCloseButton(false);
                        props.disabledButton();
                        try {
                            await RedeployApp(props.app.app_id, { pullImage: pullImage });
                            closeAllModals();
                        }
                        catch (error) {
                            setShowAlert(true);
                            setAlertMessage(error.message);
                        }
                        finally {
                            setDisable(false);
                            setShowCloseButton(true);
                            props.enableButton();
                        }
                    }
                    }>
                        {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Redeploy")}
                    </Button>
                </Modal.Footer>
            </Modal >
            {
                showAlert &&
                <Snackbar open={showAlert} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            }
        </>
    );
}

const AppDetailModal = (props): React$Element<React$FragmentType> => {
    const [restartDisable, setRestartDisable] = useState(false);//用于重启按钮的按钮禁用
    const [startDisable, setStartDisable] = useState(false); //用于启动按钮禁用
    const [stopDisable, setStopDisable] = useState(false); //用于停止按钮禁用
    const [redeployDisable, setRedeployDisable] = useState(false); //用于重建按钮禁用
    const [currentApp, setCurrentApp] = useState(props.current_app);
    const [startAppLoading, setStartAppLoading] = useState(false); //用户显示启动应用的加载状态
    const [stopAppLoading, setStopAppLoading] = useState(false); //用户显示停止时应用的加载状态
    const [restartAppLoading, setRestartAppLoading] = useState(false); //用户显示重启时应用的加载状态
    const navigate = useNavigate(); //用于页面跳转
    const childRef = useRef();
    const [containersInfo, setContainersInfo] = useState([]);
    const app_id = props?.current_app?.app_id;
    const [mainContainerId, setMainContainerId] = useState(null);
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [alertType, setAlertType] = useState("");  //用于确定弹窗的类型：error\success
    const [showRedeployConform, setShowRedeployConform] = useState(false); //用于显示状态为inactive时显示确定重建的弹窗
    const [showAccess, setShowAccess] = useState(false);
    const [showDBExpose, setShowDBExpose] = useState(false);
    const [showAppVolumes, setShowAppVolumes] = useState(false);
    const baseURL = props.baseURL;

    // const getNginxConfig = async () => {
    //     var script = "docker exec -i websoft9-apphub apphub getconfig --section nginx_proxy_manager";
    //     let content = (await cockpit.spawn(["/bin/bash", "-c", script], { superuser: "try" })).trim();
    //     content = JSON.parse(content);
    //     let listen_port = content.listen_port;

    //     baseURL = `${window.location.protocol}//${window.location.hostname}:${listen_port}`;
    // }

    let stateResult = '';
    if (currentApp && currentApp.containers) {
        // 计算每个容器状态的数量
        let stateCounts = currentApp.containers.reduce((acc, container) => {
            acc[container.State] = (acc[container.State] || 0) + 1;
            return acc;
        }, {});
        // 按照 running、restarting、paused、created、exited 的顺序拼接状态字符串
        let stateStrings = Object.keys(stateCounts).sort((a, b) => {
            if (a === 'running') return -1;
            if (b === 'running') return 1;
            return 0;
        }).map(state => `${state}(${stateCounts[state]})`);

        stateResult = stateStrings.join('-');
    }

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };


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

    //设置所有按钮禁用,用于传递给卸载页面
    const setAppdetailButtonDisable = () => {
        setStartDisable(true);
        setStopDisable(true);
        setRestartDisable(true);
        setRedeployDisable(true);
    };
    //设置所有按钮启用,用于传递给卸载页面
    const setAppdetailButtonEnable = () => {
        setStartDisable(false);
        setStopDisable(false);
        setRestartDisable(false);
        setRedeployDisable(false);
    };

    //用于关闭重建应用的弹窗
    const cancelredeployApp = () => {
        setShowRedeployConform(false);
    };

    // useEffect(() => {
    //     const fetchData = async () => {
    //         await getNginxConfig();
    //     };

    //     fetchData();
    // }, []);

    useEffect(() => {
        setCurrentApp(props.current_app);

        if (props.current_app && props.current_app.containers) {
            // 检查是否有任何容器的状态为 running、restarting、paused 或 created
            let disableStart = props.current_app.containers.some(container =>
                ['running', 'restarting', 'paused', 'created'].includes(container.State)
            );
            setStartDisable(disableStart);

            // 检查是否所有容器的状态都为 exited
            let disableStop = props.current_app.containers.every(container => container.State === 'exited');
            setStopDisable(disableStop);
        }
    }, [props.current_app]);

    useEffect(() => {
        let access = false;
        for (const key in props.current_app?.env) {
            // 检查键是否以"W9_LOGIN"开头
            if (key.startsWith('W9_LOGIN')) {
                access = true;
                break;
            }
        }

        // 检查props.current_app.env.W9_URL是否存在
        if (!!props.current_app?.env?.W9_URL) {
            access = true;
        }

        setShowAccess(access);
        setShowDBExpose(!!props.current_app?.env?.W9_DB_EXPOSE);
        setShowAppVolumes(props.current_app?.volumes?.length > 0);
    }, [props]);

    const tabContents = [
        {
            id: '1',
            title: _("Overview"),
            icon: 'mdi dripicons-home',
            text: <AppOverview data={currentApp} />,
        },
        {
            id: '2',
            title: _("Container"),
            icon: 'mdi dripicons-stack',
            text: <AppContainer data={currentApp} onDataChange={props.onDataChange} />,
        },
        {
            id: '3',
            title: _("Compose"),
            icon: 'mdi dripicons-stack',
            text: <AppCompose data={currentApp} />,
        },
        {
            id: '4',
            title: _("Uninstall"),
            icon: 'mdi mdi-cog-outline',
            text: <Uninstall data={currentApp} ref={childRef} disabledButton={setAppdetailButtonDisable} enableButton={setAppdetailButtonEnable}
                onDataChange={props.onDataChange} onCloseFatherModal={props.onClose} />,
        },
    ];
    if (showAccess) {
        tabContents.splice(1, 0, {
            id: '5',
            title: _("Access"),
            icon: 'mdi dripicons-stack',
            text: <AppAccess data={currentApp} onDataChange={props.onDataChange} />,
        });
    }
    if (showAppVolumes) {
        tabContents.splice(3, 0, {
            id: '6',
            title: _("Volumes"),
            icon: 'mdi dripicons-stack',
            text: <AppVolume data={currentApp} />,
        });
    }
    if (showDBExpose) {
        tabContents.splice(4, 0, {
            id: '7',
            title: _("Database"),
            icon: 'mdi dripicons-stack',
            text: <AppDatabases data={currentApp} />,
        });
    }

    return (
        <>
            <Modal show={props.showFlag} backdrop="static" onHide={props.onClose} size="lg" scrollable="true" dialogClassName="modal-full-width" >
                <Modal.Header onHide={props.onClose} closeButton>
                    <div style={{ padding: "10px", display: "flex", width: "100%", alignItems: "center" }}>
                        <div className='appstore-item-content-icon col-same-height'>
                            <img
                                src={`${baseURL}/media/logos/${currentApp?.app_name}-websoft9.png`}
                                alt={currentApp?.app_name}
                                className="app-icon"
                                onError={(e) => (e.target.src = DefaultImg)}
                            />
                        </div>
                        <div className='col-same-height'>
                            <h4 className="appstore-item-content-title" style={{ marginTop: "5px" }}>
                                {currentApp.app_id}
                            </h4>
                            <h5 className="appstore-item-content-title" style={{ marginTop: "5px", color: currentApp.status === 1 ? 'green' : 'red' }}>
                                {currentApp.status === 1 ? "Active" : "Inactive"} {" : "}
                                <span style={{ color: "#98a6ad" }}>{stateResult}</span>
                            </h5>
                        </div>
                        <div className='col-same-height' style={{ flexGrow: 1, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                            <OverlayTrigger
                                key="bottom1"
                                placement="bottom"
                                overlay={
                                    <Tooltip id="tooltip-bottom">
                                        {_("Start App")}
                                    </Tooltip>
                                }>
                                <Button variant="primary" disabled={startDisable}
                                    style={{ padding: "5px 10px", borderRadius: "3px", marginRight: "10px" }}
                                    onClick={async () => {
                                        setUninstallButtonDisable();
                                        setStartAppLoading(true);
                                        setStopDisable(true);
                                        setRestartDisable(true);
                                        setRedeployDisable(true);
                                        try {
                                            await StartApp(currentApp.app_id);
                                            props.onDataChange();
                                            setShowAlert(true);
                                            setAlertType("success")
                                            setAlertMessage(_("Start Success"));
                                        }
                                        catch (error) {
                                            // navigate("/error-500");
                                            setShowAlert(true);
                                            setAlertType("error")
                                            setAlertMessage(error.message);
                                        }
                                        finally {
                                            setUninstallButtonEnable();
                                            setStartAppLoading(false);
                                            setStopDisable(false);
                                            setRestartDisable(false);
                                            setRedeployDisable(false);
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
                            <OverlayTrigger
                                key="bottom2"
                                placement="bottom"
                                overlay={
                                    <Tooltip id="tooltip-bottom">
                                        {_("Stop App")}
                                    </Tooltip>
                                }>
                                <Button variant="primary" disabled={stopDisable}
                                    style={{ padding: "5px 10px", borderRadius: "3px", marginRight: "10px" }}
                                    onClick={async () => {
                                        setUninstallButtonDisable();
                                        setStopAppLoading(true);
                                        setStartDisable(true);
                                        setRestartDisable(true);
                                        setRedeployDisable(true);
                                        try {
                                            await StopApp(currentApp.app_id);
                                            props.onDataChange();
                                            setShowAlert(true);
                                            setAlertType("success")
                                            setAlertMessage(_("Stop Success"));
                                        }
                                        catch (error) {
                                            // navigate("/error-500");
                                            setShowAlert(true);
                                            setAlertType("error")
                                            setAlertMessage(error.message);
                                        }
                                        finally {
                                            setUninstallButtonEnable();
                                            setStopAppLoading(false);
                                            setStartDisable(false);
                                            setRestartDisable(false);
                                            setRedeployDisable(false);
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
                                            setStartDisable(true);
                                            setStopDisable(true);
                                            setRedeployDisable(true);

                                            await RestartApp(currentApp.app_id);
                                            props.onDataChange();
                                            setShowAlert(true);
                                            setAlertType("success")
                                            setAlertMessage(_("Restart Success"));
                                        }
                                        catch (error) {
                                            // navigate("/error-500");
                                            setShowAlert(true);
                                            setAlertType("error")
                                            setAlertMessage(error.message);
                                        }
                                        finally {
                                            setUninstallButtonEnable();
                                            setRestartAppLoading(false);
                                            setStartDisable(false);
                                            setStopDisable(false);
                                            setRedeployDisable(false);
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
                            <OverlayTrigger
                                key="bottom3"
                                placement="bottom"
                                overlay={
                                    <Tooltip id="tooltip-bottom">
                                        {_("Redeploy App")}
                                    </Tooltip>
                                }>
                                <Button disabled={redeployDisable}
                                    style={{ padding: "5px 10px", borderRadius: "3px", marginRight: "10px" }}
                                    onClick={() => { setShowRedeployConform(true) }}
                                >
                                    {
                                        // <Spinner className="spinner-border-sm noti-icon" color="light" />:
                                        <i className="dripicons-cutlery noti-icon"></i>
                                    }
                                </Button>
                            </OverlayTrigger>
                            {
                                <OverlayTrigger
                                    key="bottom5"
                                    placement="bottom"
                                    overlay={
                                        <Tooltip id="tooltip-bottom">
                                            {_("Documentation")}
                                        </Tooltip>
                                    }>
                                    <a href={`https://support.websoft9.com/${language === "zh_CN" ? '' : 'en/'}docs/${currentApp?.app_name || ''}`}
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
                                                    className={classNames(
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
                </Modal.Body>
            </Modal>
            {
                showAlert &&
                <Snackbar open={showAlert} autoHideDuration={3000} onClose={handleAlertClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleAlertClose} severity={alertType} sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            }
            {
                showRedeployConform &&
                <RedeployAppConform showConform={showRedeployConform} onClose={cancelredeployApp} app={currentApp}
                    disabledButton={setAppdetailButtonDisable} enableButton={setAppdetailButtonEnable} />
            }
        </>
    );
}

export default AppDetailModal;