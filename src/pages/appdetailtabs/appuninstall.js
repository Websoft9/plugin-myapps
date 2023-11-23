import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import classNames from 'classnames';
import cockpit from 'cockpit';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/Spinner';
import { UninstallApp } from '../../helpers';

const _ = cockpit.gettext;

const MyMuiAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

//卸载应用时的确定/取消弹窗
const UninstallConform = (props) => {
    const navigate = useNavigate(); //用于页面跳转
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [purgeData, setPurgeData] = useState(false); //卸载时是否保留数据
    const [showCloseButton, setShowCloseButton] = useState(true);//用于是否显示关闭按钮

    function closeAllModals() {
        //更新主页APP的数据
        //props.onDataChange();

        //关闭弹窗
        // props.onClose();
        // props.onCloseFatherModal();
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
                    <h4>{_("Uninstall")} {props.app.app_id}</h4>
                </Modal.Header>
                <Modal.Body className="row" >
                    <span style={{ margin: "10px 0px" }}>{_("This will immediately uninstall the app, If the data is preserved, the app can be redeploy.")}</span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold", marginRight: "10px" }}>{_("Do you want to purge the data:")}</span>
                        <Form>
                            <Form.Check
                                type="switch"
                                id="custom-switch"
                                checked={purgeData}
                                onChange={() => setPurgeData(!purgeData)}
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
                        )}
                    {" "}
                    <Button disabled={disable} variant="warning" onClick={async () => {
                        setDisable(true);
                        setShowCloseButton(false);
                        props.disableButton();
                        //调用卸载应用接口
                        try {
                            await UninstallApp(props.app.app_id, { purge_data: purgeData });
                            closeAllModals();
                        }
                        catch (error) {
                            setShowAlert(true);
                            setAlertMessage(error.message);
                        }
                        finally {
                            props.enableButton();
                            setDisable(false);
                            setShowCloseButton(true);
                        }
                    }
                    }>
                        {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Uninstall")}
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

//卸载应用选项卡
const Uninstall = forwardRef((props, ref): React$Element<React$FragmentType> => {
    const [showUninstallConform, setShowUninstallConform] = useState(false);//用于确认卸载弹窗的标识
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const navigate = useNavigate(); //用于页面跳转

    //用于显示确定/取消卸载应用的弹窗
    const handleClick = () => {
        setShowUninstallConform(true);
    };
    //用于关闭确定/取消卸载应用的弹窗
    const handleClose = () => {
        setShowUninstallConform(false);
    };

    //设置按钮禁用
    const setButtonDisable = () => {
        setDisable(true);
    };

    //设置按钮启用
    const setButtonEnable = () => {
        setDisable(false);
    };

    //提供给父组件调用的方法，用于在父组件中调用子组件的方法
    useImperativeHandle(ref, () => ({
        setButtonDisable,
        setButtonEnable,
    }));

    return (
        <>
            {/* <Row className="mb-2">
                <Col sm={12}>
                    <label className="me-1" style={{ fontWeight: "bolder", marginBottom: "5px" }}>{_("Start / Stop")}</label>
                    <p>
                        {_("Apps can be stopped to conserve server resources instead of uninstalling.")}
                    </p>
                    {props.data.status === "running" ?
                        <Button variant="secondary" className="float-end" disabled={disable} onClick={async () => {
                            props.disabledButton();
                            setDisable(true);
                            //调用应用停止接口
                            try {
                                await StopApp({ app_id: props.data.app_id });
                                props.onDataChange(props.data.app_id);
                            }
                            catch (error) {
                                navigate("/error-500");
                            }
                            finally {
                                props.enableButton();
                                setDisable(false);
                            }
                        }}>
                            {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Stop")}
                        </Button>
                        :
                        <Button variant="primary" className="float-end" disabled={disable}
                            onClick={async () => {
                                props.disabledButton();
                                setDisable(true);
                                try {
                                    let response = await StartApp({ app_id: props.data.app_id });
                                    response = JSON.parse(response);
                                    if (response.Error) {
                                        navigate("/error")
                                    }
                                    else {
                                        props.onDataChange(props.data.app_id);
                                    }
                                }
                                catch (error) {
                                    navigate("/error-500");
                                }
                                finally {
                                    props.enableButton();
                                    setDisable(false);
                                }
                            }}>
                            {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Start")}
                        </Button>
                    }
                </Col>
            </Row>
            <hr></hr> */}
            <Row className="mb-2">
                <Col sm={12}>
                    <label className="me-1" style={{ fontWeight: "bolder", marginBottom: "5px" }}>{_("Uninstall")}</label>
                    <p>
                        {_("This will uninstall the app immediately.The app will be inaccessible.")}
                    </p>
                    <Button variant="warning" className="float-end" disabled={disable} onClick={() => { handleClick() }} >
                        {_("Uninstall")}
                    </Button>
                </Col>
            </Row>
            {showUninstallConform && <UninstallConform showConform={showUninstallConform} onClose={handleClose}
                app={props.data} onDataChange={props.onDataChange} onCloseFatherModal={props.onCloseFatherModal}
                disableButton={props.disabledButton} enableButton={props.enableButton} />}
        </>
    );
});

export default Uninstall;