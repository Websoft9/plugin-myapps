import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import classNames from 'classnames';
import cockpit from 'cockpit';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DefaultImg from '../assets/images/default.png';
import FormInput from '../components/FormInput';
import Spinner from '../components/Spinner';
import { Apps, RedeployApp, RemoveApp } from '../helpers';
import AppDetailModal from './appdetail';

const _ = cockpit.gettext;
let protocol = window.location.protocol;
let host = window.location.host;
const baseURL = protocol + "//" + (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(host) ? host.split(":")[0] : host);

const MyMuiAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


//重建应用弹窗
const RedeployAppConform = (props): React$Element<React$FragmentType> => {
    const navigate = useNavigate(); //用于页面跳转
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
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
                scrollable="true" backdrop="static">
                <Modal.Header onHide={props.onClose} className={classNames('modal-colored-header', 'bg-warning')}>
                    <h4>{_("Redeploy")} {props.app.app_id}</h4>
                </Modal.Header>
                <Modal.Body className="row" >
                    <span style={{ margin: "10px 0px" }}>{_("This will be applied through local warehouse reconstruction. If the warehouse does not exist or there are errors in the warehouse file, the reconstruction will fail.")}</span>
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
                        try {
                            await RedeployApp(props.app.app_id, { pullImage: true })
                            closeAllModals();
                        }
                        catch (error) {
                            setShowAlert(true);
                            setAlertMessage(error.message);
                        }
                        finally {
                            setDisable(false);
                            setShowCloseButton(true);
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

//删除应用弹窗
const RemoveAppConform = (props): React$Element<React$FragmentType> => {
    const navigate = useNavigate(); //用于页面跳转
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
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
                scrollable="true" backdrop="static">
                <Modal.Header onHide={props.onClose} className={classNames('modal-colored-header', 'bg-warning')}>
                    <h4>{_("Remove")} {props.app.app_id}</h4>
                </Modal.Header>
                <Modal.Body className="row" >
                    <span style={{ margin: "10px 0px" }}>{_("This will immediately remove the app and remove all its data.")}</span>
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
                        try {
                            await RemoveApp(props.app.app_id);
                            closeAllModals(); //关闭弹窗并更新数据
                        }
                        catch (error) {
                            setShowAlert(true);
                            setAlertMessage(error.message);
                        }
                        finally {
                            setDisable(false);
                            setShowCloseButton(true);
                        }
                    }}>
                        {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Remove")}
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

const MyApps = (): React$Element<React$FragmentType> => {
    const [showModal, setShowModal] = useState(false); //用于显示状态为running或exited弹窗的标识
    const [showRemoveConform, setShowRemoveConform] = useState(false); //用于显示状态为inactive时显示确定删除的弹窗
    const [showRedeployConform, setShowRedeployConform] = useState(false); //用于显示状态为inactive时显示确定重建的弹窗
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [alertType, setAlertType] = useState("");//用于确定弹窗的类型：error\success

    const [selectedApp, setSelectedApp] = useState(null); //用于存储被选中的产品（点击应用详情时使用）
    const [apps, setApps] = useState([]); //所有“我的应用”
    const [statusApps, setStatusApps] = useState([]);//根据状态筛选的应用
    const [searchString, setSearchString] = useState("");//用户输入的筛选字符串
    const [selectedStatus, setSelectedStatus] = useState("all"); //用于存储用户筛选应用状态的标识
    const [progressId, setProgressId] = useState([]); //用于存储当前正在安装的应用ID，用于做进度查询的参数

    const selectedAppRef = useRef(selectedApp);
    const navigate = useNavigate(); //用于页面跳转

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getApps = async () => {
        setError(null);
        try {
            const newApps = await Apps();
            const sortedApps = newApps.sort((a, b) => {
                if (a.status === b.status) {
                    return a.app_id.localeCompare(b.app_id);
                }
                return a.status === 1 ? -1 : 1;
            });

            setApps(newApps);
            if (selectedAppRef.current) {
                const updatedApp = newApps.find(
                    (app) => app.app_id === selectedAppRef.current.app_id
                );
                setSelectedApp(updatedApp);
            }
            setLoading(false);
        }
        catch (error) {
            setError(error.message || "Internal Server Error");
        }
    }

    useEffect(() => {
        let timer = null;

        const fetchData = async () => {
            try {
                setLoading(true);
                await getApps();
                setLoading(false);
            } catch (error) {
                if (timer !== null) {
                    clearInterval(timer);
                }
            }
        };

        fetchData();
        timer = setInterval(async () => {
            await getApps();
        }, 5000);
        return () => {
            if (timer !== null) {
                clearInterval(timer);
            }
        };
    }, []);


    useEffect(() => {
        selectedAppRef.current = selectedApp;
    }, [selectedApp]);


    if (loading) return <Spinner className='dis_mid' />;
    if (error) return <p>Error : {error} </p>;

    //用于根据应用“状态”过滤应用
    const changeStatus = (selectedStatus) => {
        setSelectedStatus(selectedStatus);
    };

    //用于根据用户输入搜索应用
    const handleInputChange = (searchString) => {
        setSearchString(searchString);
    }

    //用于用户点击应用详情
    const handleClick = (app) => {
        if (app.status === 1) {
            setSelectedApp(app);
            setShowModal(true);
        }
    };

    //用于应用为inactive时删除应用
    const deleteApp = (app) => {
        setSelectedApp(app);
        setShowRemoveConform(true);
    };

    //用于应用为inactive时重建应用
    const redeployApp = (app) => {
        setSelectedApp(app);
        setShowRedeployConform(true);
    };

    //用于关闭重建应用的弹窗
    const cancelredeployApp = () => {
        setShowRedeployConform(false);
    };

    //用于取消删除应用
    const canceldeleteApp = () => {
        setShowRemoveConform(false);
    };

    //用于关闭应用详情的弹窗
    const handleClose = () => {
        setShowModal(false);
        setSelectedApp(null);
    };

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    //用于立即刷新数据
    const handleDataChange = () => {
        getApps();
    };

    return (
        <>
            <Row className="mb-2 align-items-center">
                <Col xs={12} sm={6} md={3} lg={2}>
                    <span style={{ fontSize: "28px" }}>{_("My Apps")}</span>
                </Col>
                <Col xs={12} sm={6} md={3} lg={2}>
                    <FormInput
                        value={selectedStatus}
                        name="select"
                        type="select"
                        className="form-select"
                        key="select"
                        onChange={(e) => changeStatus(e.target.value)}
                    >
                        <option value="all">{_("All States")}</option>
                        <option value="1">Active</option>
                        <option value="2">Inactive</option>
                    </FormInput>
                </Col>
                <Col xs={12} sm={12} md={6} lg={7}>
                    <FormInput
                        type="text"
                        name="search"
                        placeholder={_("Search for apps like WordPress, MySQL, GitLab, …")}
                        onChange={(e) => handleInputChange(e.target.value)}
                    />
                </Col>
                <Col xs={12} sm={12} md={12} lg={1}>
                    <Button
                        variant="primary"
                        className="float-end"
                        onClick={() => {
                            window.location.reload(true);
                        }}
                    >
                        {_("Refresh")}
                    </Button>
                </Col>
            </Row>

            {
                [true, false].map((official_app) => {
                    // 过滤出符合条件的apps
                    const filteredApps = apps.filter((app) => selectedStatus === 'all' || app.status.toString() === selectedStatus)
                        .filter((app) => app.app_official === official_app)
                        .filter((app) => app.app_id.toLowerCase().includes(searchString.toLowerCase()));
                    // 如果有数据，返回一个Row组件，否则返回null
                    return filteredApps.length > 0 ? (
                        <Row>
                            {/* 根据official_app的值显示不同的标题 */}
                            <h4 style={official_app ? {} : { paddingTop: "10px" }}>{official_app ? _("Websoft9's Apps") : _("Other Apps")}</h4>
                            {filteredApps.map((app, i) => {
                                return (
                                    <Col xxl={2} md={3} key={app.app_id + i} className="appstore-item">
                                        <div className='appstore-item-content highlight text-align-center' onClick={() => { official_app && handleClick(app) }}>
                                            {
                                                app.status === 2 ? (
                                                    <>
                                                        <div className="float-end arrow-none card-drop p-0" >
                                                            <i className="dripicons-clockwise noti-icon" title={_('Redeploy')}
                                                                style={{ marginRight: "10px" }}
                                                                onClick={() => { redeployApp(app) }}>
                                                            </i>
                                                            <i className="dripicons-trash noti-icon" title={_('Remove')} onClick={() => { deleteApp(app) }}></i>
                                                        </div>
                                                        <div className="clearfix"></div>
                                                    </>) : (
                                                    <>
                                                        <div className="float-end arrow-none card-drop p-0" >
                                                            <i className="dripicons-trash noti-icon" style={{ visibility: "hidden" }}></i>
                                                        </div>
                                                        <div className="clearfix"></div>
                                                    </>
                                                )
                                            }
                                            <div>
                                                <img
                                                    src={`${baseURL}/media/logos/${app?.app_name}-websoft9.png`}
                                                    alt={app?.app_name}
                                                    className="app-icon"
                                                    style={{ margin: "20px 10px 20px 10px" }}
                                                    onError={(e) => (e.target.src = DefaultImg)}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="appstore-item-content-title" style={{ color: "#2196f3" }}>
                                                    {app.app_id}
                                                </h3>
                                                <div style={{ color: app.status === 2 ? 'red' : 'green', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div className="m-2">
                                                        {(!official_app) ? "" : (app.status === 1 ? "Active" : "Inactive")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div >
                                    </Col>
                                )
                            })}
                        </Row >
                    ) : null;
                })
            }
            {
                apps.length <= 0 && (
                    <div className="d-flex align-items-center justify-content-center" style={{ flexDirection: "column", marginTop: "50px" }}>
                        <h3>{_("No apps installed yet!")}</h3>
                        <br></br>
                        <h4>
                            {_("How about installing some? Check out the ")}
                            <a href="#" onClick={(e) => {
                                e.preventDefault();
                                let url = 'appstore';
                                cockpit.file('/etc/hosts').watch(content => {

                                });
                                cockpit.jump(url);
                            }} >
                                {_("App Store")}
                            </a>
                        </h4>
                    </div>
                )
            }
            {
                showModal && selectedApp && selectedApp.status === 1 &&
                <AppDetailModal current_app={selectedApp} showFlag={showModal} onClose={handleClose} onDataChange={handleDataChange} />
            }
            {
                showRemoveConform &&
                <RemoveAppConform showConform={showRemoveConform} onClose={canceldeleteApp} app={selectedApp} onDataChange={handleDataChange} />
            }
            {
                showRedeployConform &&
                <RedeployAppConform showConform={showRedeployConform} onClose={cancelredeployApp} app={selectedApp} onDataChange={handleDataChange} />
            }
            {
                showAlert &&
                <Snackbar open={showAlert} autoHideDuration={5000} onClose={handleAlertClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleAlertClose} severity={alertType} sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            }
        </>
    );
};

export default MyApps;
