import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import axios from 'axios';
import classNames from 'classnames';
import cockpit from 'cockpit';
import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DefaultImgEn from '../assets/images/default_en.png';
import DefaultImgzh from '../assets/images/default_zh.png';
import FormInput from '../components/FormInput';
import Spinner from '../components/Spinner';
import { Apps, RedeployApp, RemoveApp, RemoveErrorApp } from '../helpers';
import AppDetailModal from './appdetail';

const _ = cockpit.gettext;
const language = cockpit.language;//获取cockpit的当前语言环境
const DefaultImg = language === "zh_CN" ? DefaultImgzh : DefaultImgEn;

let protocol = window.location.protocol;
let host = window.location.host;
const baseURL = `${window.location.protocol}//${window.location.hostname}`;

const MyMuiAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

//应用状态为error时，显示错误消息
const ErrorInfoModal = (props): React$Element<React$FragmentType> => {
    return (
        <Modal show={props.showConform} onHide={props.onClose} size="lg" scrollable="true" backdrop="static">
            <Modal.Header onHide={props.onClose} closeButton className={classNames('modal-colored-header', 'bg-danger')}>
                <h4>{_("This is the error message for")} {props.app.app_id}</h4>
            </Modal.Header>
            <Modal.Body className="row" >
                {
                    props.app.error &&
                    <>
                        <span style={{ margin: "10px 0px" }}> <b>{_("Detail: ")}</b>{props.app.error} </span>
                    </>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="light" onClick={props.onClose}>
                    {_("Close")}
                </Button>
                <Button variant="light" onClick={() => window.open('https://www.websoft9.com/ticket', '_blank')}>
                    {_("Support")}
                </Button>
            </Modal.Footer>
        </Modal >
    );
}

//重建应用弹窗
const RedeployAppConform = (props): React$Element<React$FragmentType> => {
    const navigate = useNavigate(); //用于页面跳转
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [showCloseButton, setShowCloseButton] = useState(true);//用于是否显示关闭按钮
    const [pullImage, setPullImage] = useState(false); //重建时是否重新拉取镜像

    function closeAllModals() {
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
                    <h4>{_("Redeploy")} {props?.app.app_id}</h4>
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
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [showCloseButton, setShowCloseButton] = useState(true);//用于是否显示关闭按钮
    const [currentApp, setCurrentApp] = useState(props.app);

    function closeAllModals() {
        window.location.reload(true);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    useEffect(() => {
        setCurrentApp(props.app);
    }, [props.app]);

    return (
        <>
            <Modal show={props.showConform} onHide={props.onClose} size="lg"
                scrollable="true" backdrop="static">
                <Modal.Header onHide={props.onClose} className={classNames('modal-colored-header', 'bg-warning')}>
                    <h4>{_("Remove")} {currentApp?.app_id}</h4>
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
                            if (props.deleteType === "error") {
                                await RemoveErrorApp(currentApp.app_id);
                            }
                            else if (props.deleteType === "inactive") {
                                await RemoveApp(currentApp.app_id);
                            }

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
    const [deleteType, setDeleteType] = useState("");//用于存储删除应用的类型：error\inactive
    const [showErrorInfo, setShowErrorInfo] = useState(false); //用于显示状态为failed时显示错误消息的弹窗

    const selectedAppRef = useRef(selectedApp);
    const navigate = useNavigate(); //用于页面跳转

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getApps = async () => {
        try {
            const newApps = await Apps();
            const statusOrder = [3, 1, 2, 0, 4]; // 定义状态的排序顺序

            // 创建一个映射表，用于将状态映射到其排序索引
            const statusRank = statusOrder.reduce((acc, status, index) => {
                acc[status] = index;
                return acc;
            }, {});

            // 使用自定义的排序函数进行排序
            const sortedApps = newApps.sort((a, b) => {
                // 首先比较状态的优先级
                if (statusRank[a.status] !== statusRank[b.status]) {
                    return statusRank[a.status] - statusRank[b.status];
                }
                // 如果状态相同，则根据 creationDate 进行降序
                return b.creationDate - a.creationDate;
            });

            setApps(sortedApps);
            if (selectedAppRef.current) {
                const updatedApp = sortedApps.find(
                    (app) => app.app_id === selectedAppRef.current.app_id
                );
                setSelectedApp(updatedApp);
            }

            setLoading(false);
            setError(null);
        }
        catch (error) {
            if (axios.isCancel(error)) {
                //不做处理
            } else {
                setError(error?.response?.data?.message || "Fetch Data Error");
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        let timer = null;
        let isMounted = true; // 增加一个标志来跟踪挂载状态
        const cancelTokenSource = axios.CancelToken.source();

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
            if (isMounted) { // 只有在组件挂载的情况下才调用 getApps
                await getApps(cancelTokenSource.token);
            }
        }, 5000);

        return () => {
            isMounted = false; // 在组件卸载时更新标志
            if (timer !== null) {
                clearInterval(timer);
            }
            cancelTokenSource.cancel('Component got unmounted'); // 取消请求
        };
    }, []);


    useEffect(() => {
        selectedAppRef.current = selectedApp;
    }, [selectedApp]);


    if (loading) return <Spinner className='dis_mid' />;
    // if (error) return <p>Error : {error} </p>;

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
    const deleteApp = (app, type) => {
        setSelectedApp(app);
        setShowRemoveConform(true);
        setDeleteType(type);
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

    //用于应用为failed时显示错误信息弹窗
    const showError = (app) => {
        setSelectedApp(app);
        setShowErrorInfo(true);
    };

    //用于关闭显示错误消息弹窗
    const cancelShowError = () => {
        setShowErrorInfo(false);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 1: // Active
                return 'green';
            case 2: // Inactive
                return 'yellow';
            case 3: // Installing
                return 'blue';
            case 4: // Error
                return 'red';
            default: // Unknown
                return 'black';
        }
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 1: // Active
                return 'bg-success';
            case 2: // Inactive
                return 'bg-warning';
            case 3: // Installing
                return 'bg-info';
            case 4: // Error
                return 'bg-danger';
            default: // Unknown
                return 'bg-dark';
        }
    }

    const statusMapping = {
        '1': 'Active',
        '2': 'Inactive',
        '3': 'Installing',
        '4': 'Error'
    };

    return (
        error ? <p>Error : {error} </p> :
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
                            <option value="3">Installing</option>
                            <option value="4">Error</option>
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
                        // 预过滤出符合条件的apps
                        const preFilteredApps = apps.filter((app) =>
                            official_app ?
                                (selectedStatus === 'all' || app.status.toString() === selectedStatus) &&
                                app.app_official === official_app && app.app_id.toLowerCase().includes(searchString.toLowerCase()) :
                                app.app_official === official_app
                        );

                        // 检查是否有官方应用和非官方应用被安装
                        const hasOfficialApps = apps.some(app => app.app_official);
                        const hasNonOfficialApps = apps.some(app => !app.app_official);


                        // 如果预过滤结果为空，则显示提示，否则进行进一步过滤并显示结果
                        if (preFilteredApps.length === 0 && official_app) {
                            if (hasOfficialApps) {
                                return (
                                    <Row>
                                        <h4 style={official_app ? {} : { paddingTop: "10px" }}>{official_app ? _("Websoft9's Apps") : _("Other Apps")}</h4>
                                        <div className="d-flex align-items-center justify-content-center" style={{ flexDirection: "column", marginTop: "50px", marginBottom: "50px" }}>
                                            <h4>{_("No Apps Found")}</h4>
                                        </div>
                                    </Row>
                                );
                            }
                            else {
                                return (
                                    <div className="d-flex align-items-center justify-content-center" style={{ flexDirection: "column", marginTop: "50px" }}>
                                        <h3>{_("No apps installed yet!")}</h3>
                                        <br></br>
                                        <h4>
                                            {_("How about installing some? Check out the ")}
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                let url = 'appstore';
                                                cockpit.file('/etc/hosts').watch(content => {
                                                    cockpit.jump(url);
                                                });
                                            }} >
                                                {_("App Store")}
                                            </a>
                                        </h4>
                                    </div>
                                )
                            }

                        }
                        else if (!official_app && !hasNonOfficialApps) {
                            // 如果没有非官方应用，不渲染 "Other Apps" 的标题
                            return null;
                        }
                        else {
                            // 进一步过滤出符合条件的apps
                            const filteredApps = official_app ? preFilteredApps.filter((app) => app.app_id.toLowerCase().includes(searchString.toLowerCase())) : preFilteredApps;

                            return (
                                <Row>
                                    {/* 根据official_app的值显示不同的标题 */}
                                    <h4 style={official_app ? {} : { paddingTop: "10px" }}>{official_app ? _("Websoft9's Apps") : _("Other Apps")}</h4>
                                    {filteredApps.map((app, i) => {
                                        return (
                                            <Col xxl={2} md={3} key={app.app_id} className="appstore-item">
                                                <div className='appstore-item-content highlight text-align-center' onClick={() => { official_app && handleClick(app) }}>
                                                    {
                                                        app.status === 2 ? // Inactive
                                                            (
                                                                <>
                                                                    <div className="float-end arrow-none card-drop p-0" >
                                                                        <i className="dripicons-clockwise noti-icon" title={_('Redeploy')}
                                                                            style={{ marginRight: "10px" }}
                                                                            onClick={() => { redeployApp(app) }}>
                                                                        </i>
                                                                        <i className="dripicons-trash noti-icon" title={_('Remove')} onClick={() => { deleteApp(app, "inactive") }}></i>
                                                                    </div>
                                                                    <div className="clearfix"></div>
                                                                </>
                                                            ) : app.status === 4 ? // Error
                                                                (
                                                                    <>
                                                                        <div className="float-end arrow-none card-drop p-0" >
                                                                            <i className="dripicons-information noti-icon" style={{ paddingRight: "10px" }} onClick={() => { showError(app) }}></i>
                                                                            <i className="dripicons-trash noti-icon" onClick={() => { deleteApp(app, "error") }}></i>
                                                                        </div>
                                                                        <div className="clearfix"></div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="float-end arrow-none card-drop p-0">
                                                                            <i className="dripicons-empty noti-icon"></i>
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
                                                        {
                                                            official_app ?
                                                                (
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        {app.status === 3 && <Spinner className="spinner-border-sm m-2" />}
                                                                        {" "}
                                                                        <div className="m-2">
                                                                            <Badge className={getStatusBadgeClass(app.status)}>
                                                                                {
                                                                                    (() => {
                                                                                        switch (app.status) {
                                                                                            case 1: return "Active";
                                                                                            case 2: return "Inactive";
                                                                                            case 3: return "Installing";
                                                                                            case 4: return "Error";
                                                                                            default: return "Unknown";
                                                                                        }
                                                                                    })()
                                                                                }
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                ) :
                                                                (
                                                                    <div style={{ visibility: 'hidden', display: 'flex' }}>
                                                                        <div className="m-2"> </div>
                                                                    </div>
                                                                )
                                                        }
                                                    </div>
                                                </div >
                                            </Col>
                                        )
                                    })}
                                </Row >
                            )
                        }
                    })
                }
                {
                    showModal && selectedApp && selectedApp.status === 1 &&
                    <AppDetailModal current_app={selectedApp} showFlag={showModal} onClose={handleClose} onDataChange={handleDataChange} />
                }
                {
                    showRemoveConform && selectedApp && (selectedApp.status === 4 || selectedApp.status === 2) &&
                    <RemoveAppConform showConform={showRemoveConform} onClose={canceldeleteApp} app={selectedApp} onDataChange={handleDataChange} deleteType={deleteType} />
                }
                {
                    showRedeployConform && selectedApp && selectedApp.status === 2 &&
                    <RedeployAppConform showConform={showRedeployConform} onClose={cancelredeployApp} app={selectedApp} onDataChange={handleDataChange} />
                }
                {
                    showErrorInfo && selectedApp && selectedApp.status === 4 &&
                    <ErrorInfoModal showConform={showErrorInfo} onClose={cancelShowError} app={selectedApp} />
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
