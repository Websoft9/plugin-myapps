import cockpit from "cockpit";
import classNames from 'classnames';
import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Table, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { CreateAppBackup, GetAppBackupList, DeleteAppBackup, RestoreAppBackup, StartApp, StopApp } from '../../helpers/api_apphub/appHub';

const _ = cockpit.gettext;

const MyMuiAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// 格式化备份数据的工具函数
const formatBackupData = (backupList) => {
    return backupList.map(backup => {
        // 格式化时间
        const formatTime = (isoTime) => {
            const date = new Date(isoTime);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        };

        // 格式化大小
        const formatSize = (bytes) => {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        return {
            id: backup.short_id || backup.id?.substring(0, 8),
            fullId: backup.id,
            time: formatTime(backup.time),
            originalTime: backup.time,
            size: formatSize(backup.summary?.total_bytes_processed || 0),
            sizeBytes: backup.summary?.total_bytes_processed || 0,
            paths: backup.paths || [],
            status: "completed", // 从API返回的都是已完成的备份
            hostname: backup.hostname,
            tags: backup.tags || [],
            summary: backup.summary
        };
    }).sort((a, b) => new Date(b.originalTime) - new Date(a.originalTime)); // 按时间降序排序
};

// 创建卷存备份的模态框组件
const CreateVolumeBackupModal = ({ show, onClose, volumesInfo, appId, onCreateSuccess }) => {
    const [disable, setDisable] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    const handleCreate = async () => {
        setDisable(true);
        try {
            // 调用实际的API
            const response = await CreateAppBackup(appId);

            // 调用成功回调函数
            if (onCreateSuccess) {
                onCreateSuccess();
            }

            onClose();
        } catch (error) {
            console.error("Failed to create backup:", error);
            setShowAlert(true);
            setAlertMessage(error.message || _("Failed to create backup"));
        } finally {
            setDisable(false);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onClose} size="lg" scrollable="true" backdrop="static" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                <Modal.Header onHide={onClose} className={classNames('modal-colored-header', 'bg-primary')}>
                    <h4>{_("Create Backup")}</h4>
                </Modal.Header>
                <Modal.Body className="row">
                    <div className="mb-3">
                        <span style={{ margin: "10px 0px" }}>{_("The following volumes will be backed up:")}</span>
                    </div>

                    {volumesInfo && volumesInfo.length > 0 ? (
                        <div className="mb-3">
                            <Table size="sm" bordered>
                                <thead>
                                    <tr>
                                        <th>{_("Name")}</th>
                                        <th>{_("Mount point")}</th>
                                        <th>{_("Driver")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {volumesInfo.map((volume, index) => (
                                        <tr key={index}>
                                            <td>{volume?.Name}</td>
                                            <td>{volume?.Mountpoint}</td>
                                            <td>{volume?.Driver}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <div className="alert alert-warning">
                            {_("No volumes found to backup.")}
                        </div>
                    )}

                    <div className="alert alert-info" role="alert" style={{ fontSize: '0.9em', fontWeight: 'normal' }}>
                        <h6>{_("Tips:")}</h6>
                        <ul className="mb-0" style={{ fontSize: '0.9em', paddingLeft: "20px" }}>
                            <li>{_("All application volumes will be included in this backup")}</li>
                            <li>{_("The backup process may take several minutes depending on data size")}</li>
                            <li>{_("Applications will remain accessible during backup")}</li>
                        </ul>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={onClose} disabled={disable}>
                        {_("Close")}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreate}
                        disabled={disable || !volumesInfo || volumesInfo.length === 0}>
                        {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />}
                        {_("Create")}
                    </Button>
                </Modal.Footer>
            </Modal>
            {showAlert && (
                <Snackbar open={showAlert} onClose={handleCloseAlert} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            )}
        </>
    );
};

// 删除卷存备份的确认模态框
const DeleteVolumeBackupModal = ({ show, onClose, backup, onDeleteSuccess }) => {
    const [disable, setDisable] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    const handleDelete = async () => {
        setDisable(true);
        try {

            // 调用实际的API
            await DeleteAppBackup(backup.fullId || backup.id);

            // 调用成功回调函数
            if (onDeleteSuccess) {
                onDeleteSuccess();
            }

            onClose();
        } catch (error) {
            console.error("Failed to delete backup:", error);
            setShowAlert(true);
            setAlertMessage(error.message || _("Failed to delete backup"));
        } finally {
            setDisable(false);
        }
    };

    const handleClose = () => {
        setIsConfirmed(false);
        onClose();
    };

    useEffect(() => {
        if (show) {
            setIsConfirmed(false);
        }
    }, [show]);

    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg" scrollable="true" backdrop="static" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                <Modal.Header onHide={handleClose} className={classNames('modal-colored-header', 'bg-warning')}>
                    <h4>{_("Delete Backup")}</h4>
                </Modal.Header>
                <Modal.Body className="row">
                    <span style={{ margin: "10px 0px" }}>{_("Are you sure you want to delete this backup? This action cannot be undone.")}</span>

                    {backup && (
                        <div className="mt-3 mb-4">
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-baseline">
                                    <span className="text-muted me-2" style={{ fontWeight: '500' }}>{_("ID")}: </span>
                                    <span style={{ wordBreak: 'break-all' }}>{backup.id}</span>
                                </div>
                                <div className="d-flex align-items-baseline">
                                    <span className="text-muted me-2" style={{ fontWeight: '500' }}>{_("Created Time")}: </span>
                                    <span>{backup.time}</span>
                                </div>
                                <div className="d-flex align-items-baseline">
                                    <span className="text-muted me-2" style={{ fontWeight: '500' }}>{_("Size")}: </span>
                                    <span>{backup.size}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                        <Form.Check
                            type="checkbox"
                            id="confirm-delete-checkbox"
                            checked={isConfirmed}
                            onChange={() => setIsConfirmed(!isConfirmed)}
                            style={{ marginRight: "10px" }}
                        />
                        <span>{_("I confirm that the backup cannot be recovered after deletion, and the data cannot be retrieved.")}</span>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={handleClose} disabled={disable}>
                        {_("Close")}
                    </Button>
                    <Button variant="warning" onClick={handleDelete} disabled={disable || !isConfirmed}>
                        {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Delete")}
                    </Button>
                </Modal.Footer>
            </Modal>
            {showAlert && (
                <Snackbar open={showAlert} onClose={handleCloseAlert} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            )}
        </>
    );
};

// 恢复卷存备份的确认模态框
const RestoreVolumeBackupModal = ({ show, onClose, backup, appId, onRestoreSuccess }) => {
    const [disable, setDisable] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("error"); // 添加警告类型状态
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [currentStep, setCurrentStep] = useState('');

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
        setAlertSeverity("error");
    };

    const handleRestore = async () => {
        setDisable(true);
        let appWasStopped = false;
        let restoreSucceeded = false;

        try {

            // 步骤1: 停止应用
            setCurrentStep(_("Stopping application..."));
            await StopApp(appId);
            appWasStopped = true;

            // 步骤2: 恢复备份
            setCurrentStep(_("Restoring backup..."));

            try {
                await RestoreAppBackup(backup.fullId || backup.id, appId);
                restoreSucceeded = true;
            } catch (restoreError) {
                console.error("Backup restore failed:", restoreError);
                setCurrentStep(_("Backup restore failed, attempting to restart application..."));

                // 恢复失败，尝试重新启动应用以恢复服务
                try {
                    await StartApp(appId);
                    setShowAlert(true);
                    setAlertSeverity("error");
                    setAlertMessage(_("Backup restore failed, but application has been restarted to maintain service availability. Error: ") + (restoreError.response?.data?.message || restoreError.message));
                } catch (startError) {
                    console.error("Failed to restart app after restore failure:", startError);
                    setShowAlert(true);
                    setAlertSeverity("error");
                    setAlertMessage(_("Critical error: Backup restore failed and application could not be restarted. Please manually start the application. Restore error: ") + (restoreError.response?.data?.message || restoreError.message));
                }
                return; // 退出函数，不执行后续步骤
            }

            // 步骤3: 启动应用（只有在恢复成功时才执行）
            if (restoreSucceeded) {
                setCurrentStep(_("Starting application..."));

                try {
                    await StartApp(appId);
                    setCurrentStep(_("Restore completed successfully"));

                    // 显示成功提示
                    setShowAlert(true);
                    setAlertSeverity("success");
                    setAlertMessage(_("Backup restored successfully! Application has been restarted and is now available."));

                    // 调用成功回调函数
                    if (onRestoreSuccess) {
                        onRestoreSuccess();
                    }

                    // 延迟关闭模态框，让用户看到成功提示
                    setTimeout(() => {
                        setIsConfirmed(false);
                        onClose();
                    }, 2000);
                } catch (startError) {
                    console.error("Failed to start app after successful restore:", startError);
                    setShowAlert(true);
                    setAlertSeverity("warning");
                    setAlertMessage(_("Backup restored successfully, but failed to start application. Please manually start the application. Error: ") + (startError.response?.data?.message || startError.message));
                }
            }

        } catch (error) {
            console.error("Unexpected error during restore process:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response,
                status: error.response?.status,
                data: error.response?.data,
                appWasStopped,
                restoreSucceeded
            });

            // 如果应用被停止了但出现了意外错误，尝试重新启动应用
            if (appWasStopped && !restoreSucceeded) {
                setCurrentStep(_("Unexpected error occurred, attempting to restart application..."));
                try {
                    await StartApp(appId);
                    setShowAlert(true);
                    setAlertSeverity("error");
                    setAlertMessage(_("Restore process failed due to unexpected error, but application has been restarted. Error: ") + (error.response?.data?.message || error.message));
                } catch (startError) {
                    console.error("Failed to restart app after unexpected error:", startError);
                    setShowAlert(true);
                    setAlertSeverity("error");
                    setAlertMessage(_("Critical error: Restore failed and application could not be restarted. Please manually start the application. Error: ") + (error.response?.data?.message || error.message));
                }
            } else {
                setShowAlert(true);
                setAlertSeverity("error");
                const errorMessage = error.response?.data?.message || error.message || _("Failed to restore backup");
                setAlertMessage(errorMessage);
            }
        } finally {
            setDisable(false);
            setCurrentStep('');
        }
    };

    const handleClose = () => {
        setIsConfirmed(false);
        onClose();
    };

    useEffect(() => {
        if (show) {
            setIsConfirmed(false);
        }
    }, [show]);

    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg" scrollable="true" backdrop="static" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                <Modal.Header onHide={handleClose} className={classNames('modal-colored-header', 'bg-danger')}>
                    <h4>{_("Restore Backup")}</h4>
                </Modal.Header>
                <Modal.Body className="row">
                    {currentStep && (
                        <div className="mb-3">
                            <div className="d-flex align-items-center">
                                <Spinner size="sm" className="me-2" />
                                <span className="text-primary">{currentStep}</span>
                            </div>
                        </div>
                    )}

                    <span style={{ margin: "10px 0px" }}>{_("Are you sure you want to restore this backup? This action will roll back your volumes to the state of this backup.")}</span>

                    {backup && (
                        <div className="mt-3 mb-4">
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex align-items-baseline">
                                    <span className="text-muted me-2" style={{ fontWeight: '500' }}>{_("ID")}: </span>
                                    <span style={{ wordBreak: 'break-all' }}>{backup.id}</span>
                                </div>
                                <div className="d-flex align-items-baseline">
                                    <span className="text-muted me-2" style={{ fontWeight: '500' }}>{_("Created Time")}: </span>
                                    <span>{backup.time}</span>
                                </div>
                                <div className="d-flex align-items-baseline">
                                    <span className="text-muted me-2" style={{ fontWeight: '500' }}>{_("Size")}: </span>
                                    <span>{backup.size}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ margin: "15px 0px" }} className="alert alert-warning" role="alert">
                        <p style={{ margin: "0px 0px 8px 0px", fontSize: '0.9em', fontWeight: 'bold' }}>{_("Tips:")}</p>
                        <ul style={{ margin: "0px", fontSize: '0.9em', paddingLeft: "20px" }}>
                            <li>{_("The application will be automatically stopped before restoration and restarted after completion.")}</li>
                            <li>{_("Restoring a backup will replace your current volume data. All data and changes made after this backup was created will be lost.")}</li>
                            <li>{_("The restoration process may take several minutes depending on the data size.")}</li>
                            <li>{_("Applications may be temporarily unavailable during the restoration process.")}</li>
                            <li>{_("Restoration carries risks. Please ensure you understand the implications before proceeding.")}</li>
                            <li>{_("Backup restoration may encounter unexpected errors or failures, which could potentially render the application unavailable.")}</li>
                        </ul>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                        <Form.Check
                            type="checkbox"
                            id="confirm-restore-checkbox"
                            checked={isConfirmed}
                            onChange={() => setIsConfirmed(!isConfirmed)}
                            style={{ marginRight: "10px" }}
                        />
                        <span>{_("I understand the risks and confirm to restore this backup, knowing that all data and changes after this backup will be lost and cannot be recovered.")}</span>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={handleClose} disabled={disable}>
                        {_("Close")}
                    </Button>
                    <Button variant="danger" onClick={handleRestore} disabled={disable || !isConfirmed}>
                        {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Restore")}
                    </Button>
                </Modal.Footer>
            </Modal>
            {showAlert && (
                <Snackbar open={showAlert} onClose={handleCloseAlert} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            )}
        </>
    );
};

const AppVolume = (props) => {
    const volumesInfo = props.data.volumes || [];
    const endpointId = props.data.endpointId;
    const appId = props.data.app_id || props.data.appId; // 获取app_id

    // 对卷存按名称进行升序排序
    const sortedVolumesInfo = [...volumesInfo].sort((a, b) => {
        const nameA = (a?.Name || '').toLowerCase();
        const nameB = (b?.Name || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // 备份相关状态
    const [showCreateBackup, setShowCreateBackup] = useState(false);
    const [showDeleteBackup, setShowDeleteBackup] = useState(false);
    const [showRestoreBackup, setShowRestoreBackup] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [volumeBackups, setVolumeBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 全局提示状态
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("success");

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
        setAlertSeverity("success");
    };

    // 获取卷存备份列表
    const getVolumeBackups = async () => {
        if (!appId) {
            console.error("App ID is required to fetch backups");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await GetAppBackupList({ app_id: appId });

            // 格式化备份数据
            const formattedBackups = formatBackupData(response.data || response);
            setVolumeBackups(formattedBackups);
        } catch (error) {
            console.error("Failed to fetch backups:", error);
            setError(_("Failed to fetch backup list") + `: ${error.message}`);
            setVolumeBackups([]);
        } finally {
            setLoading(false);
        }
    };

    // 组件加载时获取备份列表
    useEffect(() => {
        if (appId) {
            getVolumeBackups();
        }
    }, [appId]);

    // 创建卷存备份
    const handleCreateBackup = () => {
        setShowCreateBackup(true);
    };

    // 创建备份成功回调
    const handleCreateBackupSuccess = () => {
        getVolumeBackups(); // 刷新备份列表
        setShowAlert(true);
        setAlertSeverity("success");
        setAlertMessage(_("Backup created successfully!"));
    };

    // 删除卷存备份
    const handleDeleteBackup = (backup) => {
        setSelectedBackup(backup);
        setShowDeleteBackup(true);
    };

    // 删除备份成功回调
    const handleDeleteBackupSuccess = () => {
        getVolumeBackups(); // 刷新备份列表
        setShowAlert(true);
        setAlertSeverity("success");
        setAlertMessage(_("Backup deleted successfully!"));
    };

    // 恢复卷存备份
    const handleRestoreBackup = (backup) => {
        setSelectedBackup(backup);
        setShowRestoreBackup(true);
    };

    // 恢复备份成功回调
    const handleRestoreBackupSuccess = () => {
        getVolumeBackups(); // 刷新备份列表
        // 恢复成功的提示在 RestoreVolumeBackupModal 内部处理
    };

    return (
        <>
            {/* 卷存列表 */}
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header>
                            <Row className="align-items-center">
                                <Col xs={12} md={10}>
                                    <label className="me-2 fs-5 d-block">{_("Volumes")}</label>
                                </Col>
                                <Col xs={12} md={2}>
                                    <Button variant="primary" size="sm" className="float-end me-2" onClick={() => {
                                        let url = `portainer#/w9deployment/#!/${endpointId}/docker/volumes`;
                                        cockpit.file('/etc/hosts').watch(content => {
                                            cockpit.jump(url);
                                        });
                                    }}>{_("More")}</Button>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body>
                            <Table className="mb-0">
                                <thead>
                                    <tr>
                                        <th>{_("Name")}</th>
                                        <th>{_("Driver")}</th>
                                        <th>{_("Mount point")}</th>
                                        <th>{_("Created")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedVolumesInfo.map((volume, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <a href="#" onClick={(e) => {
                                                        e.preventDefault();
                                                        let url = `portainer#/w9deployment/#!/${endpointId}/docker/volumes/${volume?.Name}`;
                                                        cockpit.file('/etc/hosts').watch(content => {
                                                            cockpit.jump(url);
                                                        });
                                                    }} title=''>
                                                        {volume?.Name}
                                                    </a>
                                                </td>
                                                <td>{volume?.Driver}</td>
                                                <td>{volume?.Mountpoint}</td>
                                                <td>{volume?.CreatedAt}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 卷存备份管理 */}
            <Row className="mt-2">
                <Col xs={12}>
                    <Card>
                        <Card.Header>
                            <Row className="align-items-center">
                                <Col xs={12} md={8}>
                                    <label className="me-2 fs-5 d-block">{_("Backups")}</label>
                                </Col>
                                <Col xs={12} md={4}>
                                    <div className="d-flex gap-2 float-end">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={getVolumeBackups}
                                            disabled={loading}
                                        >
                                            {loading && <Spinner className="spinner-border-sm me-1" size="sm" />}
                                            {_("Refresh")}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleCreateBackup}
                                        >
                                            {_("Create Backup")}
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body>
                            <Table className="mb-0">
                                <thead>
                                    <tr>
                                        <th style={{ width: '20%' }}>{_("ID")}</th>
                                        <th style={{ width: '30%' }}>{_("Created Time")}</th>
                                        <th style={{ width: '25%' }}>{_("Size")}</th>
                                        <th style={{ width: '25%' }}>{_("Action")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {volumeBackups.length === 0 && !loading ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">
                                                <div className="text-muted">
                                                    {error ? error : _("No backup data available")}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        volumeBackups.map((backup) => (
                                            <tr key={backup.id}>
                                                <td style={{ verticalAlign: 'middle' }}>
                                                    {backup.id}
                                                </td>
                                                <td style={{ verticalAlign: 'middle' }}>
                                                    {backup.time}
                                                </td>
                                                <td style={{ verticalAlign: 'middle' }}>
                                                    {backup.size}
                                                </td>
                                                <td style={{ verticalAlign: 'middle' }}>
                                                    <div className="d-flex gap-3">
                                                        <a
                                                            href="#"
                                                            className="text-primary text-decoration-none"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleRestoreBackup(backup);
                                                            }}
                                                        >
                                                            {_("Restore")}
                                                        </a>
                                                        <a
                                                            href="#"
                                                            className="text-danger text-decoration-none"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleDeleteBackup(backup);
                                                            }}
                                                        >
                                                            {_("Delete")}
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                            {loading && (
                                <div className="text-center mt-3">
                                    <Spinner animation="border" variant="secondary" />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 模态框组件 */}
            <CreateVolumeBackupModal
                show={showCreateBackup}
                onClose={() => setShowCreateBackup(false)}
                volumesInfo={sortedVolumesInfo}
                appId={appId}
                onCreateSuccess={handleCreateBackupSuccess}
            />
            <DeleteVolumeBackupModal
                show={showDeleteBackup}
                onClose={() => setShowDeleteBackup(false)}
                backup={selectedBackup}
                onDeleteSuccess={handleDeleteBackupSuccess}
            />
            <RestoreVolumeBackupModal
                show={showRestoreBackup}
                onClose={() => setShowRestoreBackup(false)}
                backup={selectedBackup}
                appId={appId}
                onRestoreSuccess={handleRestoreBackupSuccess}
            />

            {/* 全局提示 */}
            {showAlert && (
                <Snackbar open={showAlert} onClose={handleCloseAlert} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            )}
        </>
    );
}

export default AppVolume;