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
import React, { useState } from 'react';
import { Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import Spinner from '../../components/Spinner';
import { RedeployApp } from '../../helpers';

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
                            <Button variant="light" onClick={() => {
                                props.handleBackToLastStep();
                                props.onClose();
                            }}>
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
                            setAlertType("error");
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
                                                            {index === steps.length - 1 ? _("Redeploy App") : _("Prompt Adjustment")}
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
                <RedeployAppConform showConform={showRedeployConform} onClose={cancelredeployApp} app={props.data} handleBackToLastStep={handleBackToLastStep} />
            }
        </>
    );
}

export default AppCompose;