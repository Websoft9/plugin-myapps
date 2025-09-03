import MuiAlert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import cockpit from "cockpit";
import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import Spinner from '../../components/Spinner';
import configManager from '../../helpers/api_apphub/configManager';

const _ = cockpit.gettext;

const MyMuiAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

//重建应用弹窗
const RedeployAppConform = (props): React$Element<React$FragmentType> => {
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertType, setAlertType] = useState("error");//用于显示错误提示类型
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [pullImage, setPullImage] = useState(false); //重建时是否重新拉取镜像
    const [showCloseButton, setShowCloseButton] = useState(true);//用于是否显示关闭按钮

    const [logs, setLogs] = useState([]);
    const [isRedeploying, setIsRedeploying] = useState(false); // 新增部署状态

    const getRequestConfig = async () => {
        try {
            // 使用统一的配置管理器获取配置
            const config = await configManager.getConfig();

            return {
                baseURL: `${window.location.protocol}//${window.location.hostname}:${config.nginxPort}/api`,
                headers: {
                    'x-api-key': config.apiKey,
                    'Accept': 'application/json'
                }
            };
        } catch (error) {
            setShowAlert(true);
            setAlertMessage(error.message);
            throw error;
        }
    };

    function closeAllModals() {
        //关闭所有弹窗
        // props.onClose();
        // props.onDataChange();
        window.location.reload(true);
    }
    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const scrollToBottom = () => {
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    const handleRedeploy = async () => {
        setIsRedeploying(true);
        setDisable(true);
        setShowCloseButton(false);
        setLogs([]);
        // props.disabledButton();

        try {
            const { baseURL, headers } = await getRequestConfig();
            const params = new URLSearchParams({
                pullImage: pullImage
            });
            const response = await fetch(`${baseURL}/apps/${props.app.app_id}/redeploy?${params}`, {
                method: 'PUT',
                headers: headers
            });

            if (!response.ok) throw new Error(response.statusText);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let success = false;

            while (true) {
                const { done, value } = await reader.read();
                buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const logEntry = JSON.parse(line);
                        setLogs(prev => [...prev, logEntry]);

                        if (logEntry.type === 'error') {
                            setAlertMessage(logEntry.message);
                            setShowAlert(true);
                        }

                        if (logEntry.status === 'success') {
                            success = true;
                            setTimeout(closeAllModals, 1000);
                        }
                    } catch (e) {
                        setLogs(prev => [...prev, {
                            timestamp: new Date().toISOString(),
                            type: 'parse_error',
                            data: line
                        }]);
                    }
                }

                if (done) {
                    if (buffer.trim()) {
                        try {
                            const logEntry = JSON.parse(buffer);
                            setLogs(prev => [...prev, logEntry]);
                            if (logEntry.status === 'success') {
                                success = true;
                                setTimeout(closeAllModals, 1000);
                            }
                        } catch (e) {
                            setLogs(prev => [...prev, {
                                timestamp: new Date().toISOString(),
                                type: 'parse_error',
                                data: buffer
                            }]);
                        }
                    }
                    if (!success) {
                        setShowAlert(true);
                        setAlertMessage(_("Redeployment failed unexpectedly"));
                    }
                    break;
                }
            }
        } catch (error) {
            setIsRedeploying(false); // 出错时重置状态
            setShowAlert(true);
            setAlertMessage(error.message);
        } finally {
            setDisable(false);
            setShowCloseButton(true);
            props.enableButton();
        }
    }

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
                    {/* 新增日志显示区域 */}
                    {isRedeploying && (
                        <div id="log-container" style={{
                            height: '200px',
                            overflowY: 'auto',
                            backgroundColor: '#000',
                            color: '#fff',
                            padding: '10px',
                            marginTop: '10px',
                            fontFamily: 'monospace',
                            borderRadius: '4px'
                        }}>
                            {/* {logs.map((log, index) => (
                                <div key={index} style={{
                                    color: log.type === 'error' ? '#ff4444' : '#fff',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.5',
                                    fontSize: '0.9em'
                                }}>
                                    {log.timestamp && `[${new Date(log.timestamp).toLocaleTimeString()}] `}
                                    {log.data || log.message}
                                </div>
                            ))} */}
                            {logs.map((log, index) => {
                                // 新增数据格式化方法
                                const formatLogData = (data) => {
                                    if (typeof data === 'object' && data !== null) {
                                        // 处理镜像拉取信息
                                        if (data.status && data.id) {
                                            return `${data.status}: ${data.id}`;
                                        }
                                        if (data.status) {
                                            return data.status;
                                        }
                                        // 保底处理复杂对象
                                        return JSON.stringify(data, null, 2);
                                    }
                                    return data;
                                };

                                return (
                                    <div key={index} style={{
                                        color: log.type === 'error' ? '#ff4444' : '#fff',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.5',
                                        fontSize: '0.9em'
                                    }}>
                                        {log.timestamp && `[${new Date(log.timestamp).toLocaleTimeString()}] `}
                                        {formatLogData(log.data) || log.message}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {
                        showCloseButton && (
                            <Button variant="light" onClick={() => {
                                props.handleBackToLastStep();
                                props.onClose();
                            }}>
                                {_("Close")}
                            </Button>
                        )
                    }
                    {" "}
                    <Button disabled={disable} variant="warning" onClick={handleRedeploy}>
                        {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Redeploy")}
                    </Button>
                </Modal.Footer>
            </Modal >
            {/* {
                showAlert &&
                <Snackbar open={showAlert} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            } */}
            {
                showAlert &&
                ReactDOM.createPortal(
                    <Snackbar open={showAlert} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} style={{ zIndex: 9999 }}>
                        <MyMuiAlert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                            {alertMessage}
                        </MyMuiAlert>
                    </Snackbar>,
                    document.body
                )
            }
        </>
    );
}


const steps = [
    {
        label: _("Modify the Git repository for this application."),
        description: _("Websoft9's applications adopt the popular GitOps pattern in cloud-native architecture, where the orchestration source code of the application is codified and stored in a Git repository."),
    },
    {
        label: _("Redeploy App"),
        description:
            _("Rebuild the application after orchestrating it on-demand.")
    },
];

const AppCompose = (props): React$Element<React$FragmentType> => {
    const [activeStep, setActiveStep] = React.useState(0);
    const [showRedeployConform, setShowRedeployConform] = useState(false); //用于显示状态为inactive时显示确定重建的弹窗

    const handleNext = () => {
        //setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setActiveStep((prevActiveStep) => {
            const nextStep = prevActiveStep + 1;
            if (nextStep < steps.length) { // 如果下一步不是最后一步，跳转到指定的页面
                let user_name = props.data?.gitConfig?.Authentication?.Username || "websoft9"
                let url = `gitea#/w9git/${user_name}/${props.data?.app_id}`;
                //cockpit.file('/etc/hosts').watch(content => {
                cockpit.jump(url);
                //});
            }
            return nextStep;
        });
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const handleBackToLastStep = () => {
        setActiveStep(steps.length - 1);
    };


    const cancelredeployApp = () => {
        setShowRedeployConform(false);
    };

    return (
        <>
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header>
                            <label className="me-2 fs-5 d-block">{_("Compose")}</label>
                            <span className="me-2 fs-6">
                                {_("Rebuild the application after orchestrating it on-demand. Suitable for users familiar with Docker.")}
                            </span>
                        </Card.Header>
                        <Card.Body>
                            <Box sx={{ maxWidth: 400 }}>
                                <Stepper activeStep={activeStep} orientation="vertical">
                                    {steps.map((step, index) => (
                                        <Step key={step.label}>
                                            <StepLabel>
                                                {step.label}
                                            </StepLabel>
                                            <StepContent>
                                                <Typography>{step.description}</Typography>
                                                <Box sx={{ mb: 2, mt: 1 }}>
                                                    <div>
                                                        <Button
                                                            variant="primary"
                                                            size='sm'
                                                            onClick={() => {
                                                                if (index === steps.length - 1) {
                                                                    handleNext();
                                                                    setShowRedeployConform(true);
                                                                } else {
                                                                    handleNext();
                                                                }
                                                            }}
                                                        >
                                                            {index === steps.length - 1 ? _("Redeploy App") : _("Go to Edit Repository")}
                                                        </Button>
                                                        <Button
                                                            variant="link"
                                                            size='sm'
                                                            disabled={index === 0}
                                                            onClick={handleBack}
                                                        >
                                                            {_("Back")}
                                                        </Button>
                                                    </div>
                                                </Box>
                                            </StepContent>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {
                showRedeployConform &&
                <RedeployAppConform showConform={showRedeployConform} onClose={cancelredeployApp} app={props.data} handleBackToLastStep={handleBackToLastStep} enableButton={props.enableButton} disableButton={props.disabledButton} />
            }
        </>
    );
}

export default AppCompose;