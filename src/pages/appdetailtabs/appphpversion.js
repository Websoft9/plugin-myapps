import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import cockpit from "cockpit";
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Table, Form } from 'react-bootstrap';

const _ = cockpit.gettext;

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AppPhpVersion = (props) => {

    const [phpDetails, setPhpDetails] = useState({ version: _("Loading..."), modules: { Loading: [_("Loading...")] } });
    const [showVersionForm, setShowVersionForm] = useState(false); // 控制版本修改表单的显示
    const [selectedVersion, setSelectedVersion] = useState(''); // 保存用户选择的版本
    const [remarks, setRemarks] = useState(''); // 保存用户填写的联系信息和备注
    const [validationError, setValidationError] = useState(''); // 验证错误信息
    const [showAlert, setShowAlert] = useState(false); // 用于是否显示提示
    const [alertMessage, setAlertMessage] = useState(""); // 用于显示提示消息
    const [alertType, setAlertType] = useState(""); // 用于确定弹窗的类型：error\success

    // 处理Snackbar关闭
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    // 切换版本修改表单显示状态
    const toggleVersionForm = () => {
        setShowVersionForm(!showVersionForm);
        if (showVersionForm) {
            // 隐藏时清空验证错误和表单
            setValidationError('');
            setSelectedVersion('');
            setRemarks('');
        }
    };

    // 验证表单
    const validateContact = () => {
        if (!selectedVersion) {
            setValidationError(_("Please select target PHP version"));
            return false;
        }

        if (!remarks.trim()) {
            setValidationError(_("Please provide contact information and remarks"));
            return false;
        }

        // 检查是否包含电话或邮箱信息
        const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(remarks);
        const hasPhone = /[\d\s\-\+\(\)\.]{7,}/.test(remarks);

        if (!hasEmail && !hasPhone) {
            setValidationError(_("Please provide at least phone number or email address in remarks"));
            return false;
        }

        setValidationError('');
        return true;
    };    // 带超时机制的spawn执行方法
    const executeWithTimeout = async (script, timeout = 15000) => {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(_("Request timeout")));
            }, timeout);

            cockpit.spawn(["/bin/bash", "-c", script], { superuser: "try" })
                .then((result) => {
                    clearTimeout(timeoutId);
                    resolve(result);
                })
                .catch((error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    };

    // 提交版本修改请求
    const handleSubmitRequest = async () => {
        if (validateContact()) {
            try {
                const currentVersion = phpDetails.version || "unknown";
                const appName = props.data?.app_name || props.data?.name || "Unknown App";

                const webhookData = {
                    "msgtype": "markdown",
                    "markdown": {
                        "content": `<font color="warning">PHP版本迁移申请</font>\n>应用名称：<font color="comment">${appName}</font>\n>当前版本：<font color="comment">${currentVersion}</font>\n>目标版本：<font color="comment">${selectedVersion === 'other' ? '其他版本(详见备注)' : `PHP ${selectedVersion}`}</font>\n>备注信息：<font color="comment">${remarks}</font>`
                    }
                };

                // 动态获取企业微信webhook URL
                const webhookUrlResult = await executeWithTimeout("docker exec -i websoft9-apphub apphub getsysconfig --section webhook --key wechat");
                const webhookUrl = webhookUrlResult.trim();

                if (!webhookUrl || webhookUrl === '' || webhookUrl.includes('error') || webhookUrl.includes('Error')) {
                    throw new Error(_("Failed to get webhook URL"));
                }

                // 使用curl发送到企业微信webhook
                const script = `curl -s -X POST "${webhookUrl}" \\
                    -H "Content-Type: application/json" \\
                    -d '${JSON.stringify(webhookData).replace(/'/g, "'\"'\"'")}'`;

                const response = await executeWithTimeout(script);

                // 检查响应
                if (response.trim() === '' || response.includes('"errcode":0')) {
                    setShowAlert(true);
                    setAlertMessage(_("Request submitted successfully"));
                    setAlertType("success");
                    // 清空表单并隐藏
                    setSelectedVersion('');
                    setRemarks('');
                    setShowVersionForm(false);
                } else {
                    throw new Error(_("Request submission failed"));
                }
            } catch (error) {
                setShowAlert(true);
                setAlertMessage(_("Submission failed, please try again"));
                setAlertType("error");
            }
        }
    };

    useEffect(() => {
        const fetchPhpDetails = async () => {
            const appId = props.data?.app_id || "default_app_id";
            try {
                const phpVersionRaw = await cockpit.spawn(["/bin/bash", "-c", `docker exec -i ${appId} php -v`], { superuser: "try" });
                const phpModules = await cockpit.spawn(["/bin/bash", "-c", `docker exec -i ${appId} php -m`], { superuser: "try" });

                const versionMatch = phpVersionRaw.match(/PHP\s+(\d+\.\d+\.\d+)/);
                const phpVersion = versionMatch ? `PHP ${versionMatch[1]}` : phpVersionRaw.trim();

                const modules = phpModules.trim().split("\n");
                const categorizedModules = {};
                let currentCategory = "";

                modules.forEach((module) => {
                    if (module.startsWith("[") && module.endsWith("]")) {
                        currentCategory = module.slice(1, -1);
                        categorizedModules[currentCategory] = [];
                    } else if (currentCategory) {
                        categorizedModules[currentCategory].push(module);
                    }
                });

                setPhpDetails({
                    version: phpVersion,
                    modules: categorizedModules
                });
            } catch (error) {
                console.error("Error fetching PHP details:", error);
                setPhpDetails({
                    version: _("Error fetching version"),
                    modules: { Error: [_("Error fetching modules")] }
                });
            }
        };

        fetchPhpDetails();
    }, [props.data?.app_id]); // 添加依赖以在 app_id 变化时重新获取数据

    return (
        <>
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header>
                            <label className="me-2 fs-5 d-block">{_("PHP Overview")}</label>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive className="mb-0" bordered={false}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: "bold", whiteSpace: "nowrap", verticalAlign: "middle" }}>{_("Current PHP Version")}:</td>
                                        <td>{phpDetails.version}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: "bold", whiteSpace: "nowrap", verticalAlign: "middle" }}>{_("Installed PHP Modules")}:</td>
                                        <td>
                                            {Object.entries(phpDetails.modules).map(([category, modules], index, array) => (
                                                <div key={category} style={{ marginBottom: "10px" }}>
                                                    <strong>{_(category)}:</strong>
                                                    <div style={{ margin: "5px 0" }} />
                                                    {modules.join(", ")}
                                                    {index < array.length - 1 && <hr style={{ margin: "10px 0", borderColor: "#ddd" }} />}
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: "bold", whiteSpace: "nowrap", verticalAlign: "middle" }}>{_("Switch PHP Version")}:</td>
                                        <td>
                                            <Button
                                                variant={showVersionForm ? "outline-secondary" : "primary"}
                                                size="sm"
                                                onClick={toggleVersionForm}
                                            >
                                                {showVersionForm ? _("Cancel Switch") : _("Request Migration")}
                                            </Button>
                                            <span style={{ marginLeft: "10px", fontSize: "14px", color: "#6c757d", fontStyle: "italic" }}>
                                                {_("PHP version migration requires technical assistance to ensure compatibility")}
                                            </span>
                                        </td>
                                    </tr>
                                    {showVersionForm && (
                                        <tr>
                                            <td colSpan="2" style={{
                                                padding: "12px",
                                                backgroundColor: "#f8f9fa",
                                                border: "1px solid #e9ecef",
                                                borderRadius: "6px"
                                            }}>
                                                <div style={{ marginBottom: "15px" }}>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <div style={{
                                                            whiteSpace: "nowrap",
                                                            minWidth: "140px",
                                                            paddingRight: "15px",
                                                            fontSize: "13px"
                                                        }}>
                                                            {_("Target Version")} <span style={{ color: 'red' }}>*</span>
                                                        </div>
                                                        <div style={{ flex: 1, maxWidth: "300px" }}>
                                                            <Form.Select
                                                                value={selectedVersion}
                                                                onChange={(e) => setSelectedVersion(e.target.value)}
                                                                size="sm"
                                                                style={{ fontSize: "13px" }}
                                                            >
                                                                <option value="">{_("Select Version")}</option>
                                                                <option value="7.4">PHP 7.4</option>
                                                                <option value="8.0">PHP 8.0</option>
                                                                <option value="8.1">PHP 8.1</option>
                                                                <option value="8.2">PHP 8.2</option>
                                                                <option value="8.3">PHP 8.3</option>
                                                                <option value="other">{_("Other (specify in remarks)")}</option>
                                                            </Form.Select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ marginBottom: "15px" }}>
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <div style={{
                                                            whiteSpace: "nowrap",
                                                            minWidth: "140px",
                                                            paddingRight: "15px",
                                                            fontSize: "13px"
                                                        }}>
                                                            {_("Remarks")} <span style={{ color: 'red' }}>*</span>
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            {/* 注意提示 */}
                                                            <div style={{
                                                                backgroundColor: "#fff3cd",
                                                                border: "1px solid #ffeaa7",
                                                                borderRadius: "4px 4px 0 0",
                                                                padding: "6px 10px",
                                                                fontSize: "11px",
                                                                color: "#856404"
                                                            }}>
                                                                <i className="fas fa-info-circle" style={{ marginRight: "4px", color: "#ffc107" }}></i>
                                                                <strong>{_("Note")}:</strong>
                                                                <span style={{ marginLeft: "4px" }}>
                                                                    {_("Please include your contact information in the remarks and ensure it is accurate so we can reach you.")}
                                                                </span>
                                                            </div>

                                                            {/* 不可编辑的示例 */}
                                                            <div style={{
                                                                backgroundColor: "#fff",
                                                                border: "1px solid #dee2e6",
                                                                borderTop: "none",
                                                                padding: "6px 10px",
                                                                fontSize: "11px",
                                                                color: "#6c757d",
                                                                borderBottom: "1px dashed #dee2e6"
                                                            }}>
                                                                <i className="fas fa-lightbulb" style={{ marginRight: "4px", color: "#ffc107" }}></i>
                                                                <strong style={{ color: "#495057" }}>{_("Example")}:</strong>
                                                                <span style={{ marginLeft: "4px" }}>
                                                                    {_("John Smith, +86 138-0013-8000, john@company.com , Upgrade to PHP 8.2")}
                                                                </span>
                                                            </div>

                                                            <Form.Control
                                                                as="textarea"
                                                                rows={3}
                                                                value={remarks}
                                                                onChange={(e) => setRemarks(e.target.value)}
                                                                placeholder={_("Please provide contact information and remarks")}
                                                                size="sm"
                                                                style={{
                                                                    borderRadius: "0 0 4px 4px",
                                                                    borderTop: "none",
                                                                    fontSize: "13px"
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {validationError && (
                                                    <div className="alert alert-danger mb-3" role="alert" style={{
                                                        padding: "6px 10px",
                                                        fontSize: "12px",
                                                        border: "1px solid #f5c6cb",
                                                        borderRadius: "4px",
                                                        backgroundColor: "#f8d7da"
                                                    }}>
                                                        <i className="fas fa-exclamation-triangle" style={{ marginRight: "4px" }}></i>
                                                        {validationError}
                                                    </div>
                                                )}

                                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={handleSubmitRequest}
                                                        style={{
                                                            minWidth: "100px",
                                                            fontSize: "13px",
                                                            fontWeight: "500"
                                                        }}
                                                    >
                                                        <i className="fas fa-paper-plane" style={{ marginRight: "4px" }}></i>
                                                        {_("Get Support")}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Snackbar open={showAlert} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    );
}

export default AppPhpVersion;