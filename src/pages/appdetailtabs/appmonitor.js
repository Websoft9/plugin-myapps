import cockpit from "cockpit";
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Form, Button, Spinner } from 'react-bootstrap';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { executeWithTimeout, executeCurlCommand, getSystemConfig } from '../../helpers/api_apphub';
import { monitorAPI, metadataService, configService } from '../../utils/monitorUtils';

const _ = cockpit.gettext;

const MyMuiAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AppMonitor = (props) => {
    const app_id = props.data?.app_id;

    // 处理domain_names数组，提取所有域名并合并成一个数组
    const extractDomainNames = (domainData) => {
        if (!domainData || !Array.isArray(domainData)) {
            return [];
        }

        const allDomains = [];
        domainData.forEach(item => {
            if (item && item.domain_names && Array.isArray(item.domain_names)) {
                item.domain_names.forEach(domain => {
                    // 根据certificate判断协议，enabled判断状态
                    const protocol = item.certificate ? 'https' : 'http';
                    const isEnabled = item.enabled === 1;

                    allDomains.push({
                        domain: domain,
                        protocol: protocol,
                        enabled: isEnabled,
                        url: `${protocol}://${domain}`,
                        displayText: `${protocol}://${domain}`
                    });
                });
            }
        });

        // 去除重复域名
        const uniqueDomains = allDomains.filter((item, index, self) =>
            index === self.findIndex(t => t.url === item.url)
        );

        return uniqueDomains;
    };

    const domain_names = extractDomainNames(props.data?.domain_names);

    // 状态管理
    const [monitorUrl, setMonitorUrl] = useState('');
    const [notificationEmail, setNotificationEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [monitorStatus, setMonitorStatus] = useState('disabled'); // 'disabled', 'enabled', 'loading'
    const [monitorData, setMonitorData] = useState(null);
    const [dashboardUrl, setDashboardUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Snackbar 状态管理
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");

    // 从应用数据获取网址选项
    const urlOptions = [
        { value: '', label: _('Select monitor URL'), disabled: false },
        ...domain_names.map(item => ({
            value: item.url,
            label: item.displayText,
            disabled: false // 移除禁用逻辑，允许所有域名被选择
        }))
    ];

    // 邮箱验证
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setNotificationEmail(email);
        setIsEmailValid(email === '' || validateEmail(email));
    };

    // 处理 Snackbar 关闭
    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    // API调用函数
    const queryMonitorStatus = async () => {
        setLoading(true);
        try {
            // 获取实例ID和应用ID构建监控ID
            const instanceId = await metadataService.getInstanceId();
            const monitorId = `${instanceId}_${app_id}`;

            // 调用查询监控状态API
            const response = await monitorAPI.getMonitorStatus(monitorId);

            // 根据API响应设置状态
            if (response && response.domain && response.email) {
                setMonitorStatus('enabled');
                setMonitorUrl(response.domain);
                setNotificationEmail(response.email);
                setDashboardUrl(response.grafurl || '');
            } else {
                // 响应格式不正确，设置为未启用状态
                setMonitorStatus('disabled');
                setMonitorUrl('');
                setNotificationEmail('');
                setDashboardUrl('');
            }

        } catch (err) {
            // 检查是否是404错误（监控未启用）
            if (err.message && (err.message.includes('404') || err.message.includes('Not Found'))) {
                // 404表示监控未启用，这是正常情况，不需要显示错误
                setMonitorStatus('disabled');
                setMonitorUrl('');
                setNotificationEmail('');
                setDashboardUrl('');
                // 不打印日志，因为这是预期的正常情况
            } else {
                // 其他错误（网络错误、服务器错误等）才是真正的错误
                setMonitorStatus('disabled');
                setMonitorUrl('');
                setNotificationEmail('');
                setDashboardUrl('');
                console.warn('Query monitor status error:', err.message || err);
            }
        } finally {
            setLoading(false);
        }
    };

    const enableMonitoring = async () => {
        if (!monitorUrl || !notificationEmail || !isEmailValid) return;

        setLoading(true);
        try {
            // 获取实例ID和应用ID构建监控ID
            const instanceId = await metadataService.getInstanceId();
            const monitorId = `${instanceId}_${app_id}`;

            // 获取当前语言
            const lang = cockpit.language || 'en_US';

            // 调用启用监控API
            const response = await monitorAPI.enableMonitoring(monitorId, monitorUrl, notificationEmail, lang);

            // 检查响应格式
            if (!response || !response.grafurl) {
                throw new Error(_("Invalid response format from monitoring service"));
            }

            setMonitorStatus('enabled');
            setDashboardUrl(response.grafurl);
            setIsEditing(false);

            setShowAlert(true);
            setAlertMessage(_("Monitoring enabled successfully"));
            setAlertType("success");

        } catch (err) {
            setShowAlert(true);
            setAlertMessage(err.message || _("Failed to enable monitoring"));
            setAlertType("error");
            console.error('Enable monitoring error:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateMonitoring = async () => {
        if (!monitorUrl || !notificationEmail || !isEmailValid) return;

        setLoading(true);
        try {
            // 获取实例ID和应用ID构建监控ID
            const instanceId = await metadataService.getInstanceId();
            const monitorId = `${instanceId}_${app_id}`;

            // 获取当前语言
            const lang = cockpit.language || 'en_US';

            // 调用更新监控API
            const response = await monitorAPI.updateMonitoring(monitorId, monitorUrl, notificationEmail, lang);

            // 检查响应格式
            if (!response || !response.grafurl) {
                throw new Error(_("Invalid response format from monitoring service"));
            }

            setDashboardUrl(response.grafurl);
            setIsEditing(false);

            setShowAlert(true);
            setAlertMessage(_('Monitoring configuration updated successfully'));
            setAlertType("success");

        } catch (err) {
            setShowAlert(true);
            setAlertMessage(err.message || _('Failed to update monitoring'));
            setAlertType("error");
            console.error('Update monitoring error:', err);
        } finally {
            setLoading(false);
        }
    };

    const disableMonitoring = async () => {
        setLoading(true);
        try {
            // 获取实例ID和应用ID构建监控ID
            const instanceId = await metadataService.getInstanceId();
            const monitorId = `${instanceId}_${app_id}`;

            // 调用禁用监控API
            await monitorAPI.disableMonitoring(monitorId);

            setMonitorStatus('disabled');
            setDashboardUrl('');
            setMonitorUrl('');
            setNotificationEmail('');
            setIsEditing(false);

            setShowAlert(true);
            setAlertMessage(_('Monitoring disabled successfully'));
            setAlertType("success");

        } catch (err) {
            setShowAlert(true);
            setAlertMessage(err.message || _('Failed to disable monitoring'));
            setAlertType("error");
            console.error('Disable monitoring error:', err);
        } finally {
            setLoading(false);
        }
    };

    // 组件挂载时查询监控状态
    useEffect(() => {
        if (app_id) {
            // 初始化配置并查询监控状态
            const initializeAndQuery = async () => {
                try {
                    await configService.initializeConfig();
                    await queryMonitorStatus();
                } catch (error) {
                    console.error("Failed to initialize config or query status:", error);
                    // 即使初始化失败，也要设置一个默认状态
                    setMonitorStatus('disabled');
                    setLoading(false);
                }
            };

            initializeAndQuery();
        }
    }, [app_id, props.dataRefreshKey]); // 添加 dataRefreshKey 作为依赖

    const handleEnableMonitoring = () => {
        if (monitorUrl && notificationEmail && isEmailValid) {
            enableMonitoring();
        }
    };

    const handleUpdateMonitoring = () => {
        if (monitorUrl && notificationEmail && isEmailValid) {
            updateMonitoring();
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // 恢复原来的值
        queryMonitorStatus();
    };

    return (
        <>
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header>
                            <label className="me-2 fs-5 d-block">{_("Monitor")}</label>
                            <span className="me-2 fs-6 text-muted">
                                {_("Monitor website uptime and performance with real-time alerts and email notifications")}
                            </span>
                        </Card.Header>
                        <Card.Body>
                            {/* 监控配置区域 */}
                            <Row className="mb-3 align-items-center">
                                <Col xs={5} className="d-flex align-items-center">
                                    <Form.Label className="me-2 mb-0 text-nowrap">{_("Monitor URL")}:</Form.Label>
                                    <Form.Select
                                        value={monitorUrl}
                                        onChange={(e) => setMonitorUrl(e.target.value)}
                                        size="sm"
                                        disabled={domain_names.length === 0 || (monitorStatus === 'enabled' && !isEditing) || loading}
                                        className="flex-grow-1"
                                    >
                                        {domain_names.length === 0 ? (
                                            <option value="">{_("No domain names available")}</option>
                                        ) : (
                                            urlOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))
                                        )}
                                    </Form.Select>
                                </Col>

                                <Col xs={4} className="d-flex align-items-center">
                                    <Form.Label className="me-2 mb-0 text-nowrap">{_("Notification Email")}:</Form.Label>
                                    <div className="flex-grow-1 d-flex align-items-center">
                                        <Form.Control
                                            type="email"
                                            placeholder="admin@example.com"
                                            value={notificationEmail}
                                            onChange={handleEmailChange}
                                            isInvalid={!isEmailValid}
                                            size="sm"
                                            disabled={(monitorStatus === 'enabled' && !isEditing) || loading}
                                            className="me-2"
                                        />
                                        {!isEmailValid && (
                                            <span className="text-danger small text-nowrap" style={{ fontSize: '0.75rem' }}>
                                                {_("Invalid email")}
                                            </span>
                                        )}
                                    </div>
                                </Col>

                                <Col xs={3} className="d-flex justify-content-end gap-2">
                                    {monitorStatus === 'disabled' && (
                                        <Button
                                            variant="primary"
                                            onClick={handleEnableMonitoring}
                                            disabled={!monitorUrl || !notificationEmail || !isEmailValid || loading || domain_names.length === 0}
                                            size="sm"
                                        >
                                            {loading ? _("Enabling...") : _("Enable")}
                                        </Button>
                                    )}

                                    {monitorStatus === 'enabled' && !isEditing && (
                                        <>
                                            <Button
                                                variant="outline-primary"
                                                onClick={handleEditClick}
                                                disabled={loading}
                                                size="sm"
                                            >
                                                {_("Edit")}
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                onClick={disableMonitoring}
                                                disabled={loading}
                                                size="sm"
                                            >
                                                {loading ? _("Disabling...") : _("Disable")}
                                            </Button>
                                        </>
                                    )}

                                    {monitorStatus === 'enabled' && isEditing && (
                                        <>
                                            <Button
                                                variant="success"
                                                onClick={handleUpdateMonitoring}
                                                disabled={!monitorUrl || !notificationEmail || !isEmailValid || loading}
                                                size="sm"
                                            >
                                                {loading ? _("Updating...") : _("Update")}
                                            </Button>
                                            <Button
                                                variant="outline-secondary"
                                                onClick={handleCancelEdit}
                                                disabled={loading}
                                                size="sm"
                                            >
                                                {_("Cancel")}
                                            </Button>
                                        </>
                                    )}
                                </Col>
                            </Row>

                            {/* 状态和提示信息行 */}
                            {domain_names.length === 0 && (
                                <Row className="mb-2">
                                    <Col xs={12}>
                                        <div className="d-flex align-items-center px-2 py-1" style={{
                                            backgroundColor: '#fff3cd',
                                            border: '1px solid #ffeaa7',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.75rem'
                                        }}>
                                            <i className="fas fa-exclamation-triangle text-warning me-1" style={{ fontSize: '0.7rem' }}></i>
                                            <span style={{ color: '#856404' }}>
                                                {_("Please bind a domain name to the application before enabling monitoring.")}
                                            </span>
                                        </div>
                                    </Col>
                                </Row>
                            )}

                            {/* 监控图表iframe - 只有在启用监控且有仪表板URL时才显示 */}
                            {monitorStatus === 'enabled' && dashboardUrl && (
                                <div className="mt-3">
                                    <iframe
                                        src={dashboardUrl}
                                        style={{
                                            width: '100%',
                                            height: '400px',
                                            border: '1px solid #dee2e6',
                                            borderRadius: '0.375rem'
                                        }}
                                        title={_("Monitor Dashboard")}
                                    />
                                </div>
                            )}

                            {/* 未启用监控时的占位符 */}
                            {monitorStatus === 'disabled' && (
                                <div className="mt-3" style={{
                                    height: '400px',
                                    border: '2px dashed #dee2e6',
                                    borderRadius: '0.375rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f8f9fa'
                                }}>
                                    <div className="text-center text-muted">
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                                        <div style={{ fontSize: '16px', fontWeight: '500' }}>
                                            {_("Monitoring Dashboard")}
                                        </div>
                                        <div style={{ fontSize: '14px', marginTop: '8px' }}>
                                            {_("Enable monitoring to view real-time data")}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Snackbar 提示 */}
            {showAlert && (
                <Snackbar open={showAlert} autoHideDuration={3000} onClose={handleAlertClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleAlertClose} severity={alertType} sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            )}
        </>
    );
}

export default AppMonitor;
