import FileCopyIcon from '@mui/icons-material/FileCopy';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MuiAlert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import cockpit from "cockpit";
import React, { useState } from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';
import dbConfig from '../../data/dbConfig';

const _ = cockpit.gettext;

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AppDatabases = (props): React$Element<React$FragmentType> => {
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [alertType, setAlertType] = useState("");  //用于确定弹窗的类型：error\success

    const dbArray = [];
    const app_id = props.data.app_id;
    const db_expose = props.data.env?.W9_DB_EXPOSE

    if (typeof db_expose === 'string') {
        const dbs = db_expose.split(',');
        dbs.forEach(dbName => {
            const dbObject = {
                name: dbName,
                host: app_id + '-' + dbName,
                password: props.data.env?.W9_POWER_PASSWORD,
            };

            dbArray.push(dbObject);
        });
    }

    const togglePasswordVisibility = (index) => {
        setVisiblePasswords((prevVisiblePasswords) => ({
            ...prevVisiblePasswords,
            [index]: !prevVisiblePasswords[index],
        }));
    };

    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setShowAlert(true);
                setAlertMessage(_("Copied successfully"));
                setAlertType("success");
            }).catch(err => {
                setShowAlert(true);
                setAlertMessage(_("Copied failed"));
                setAlertType("error");
            });
        }
        else {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);

                setShowAlert(true);
                setAlertMessage(_("Copied successfully"));
                setAlertType("success");
            }
            catch (err) {
                setShowAlert(true);
                setAlertMessage(_("Copied failed"));
                setAlertType("error");
            }
        }
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
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header>
                            <Row className="align-items-center">
                                <Col xs={12} md={10}>
                                    <label className="me-2 fs-5 d-block">{_("Database")}</label>
                                </Col>
                                <Col xs={12} md={2}>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body>
                            <Table className="mb-0">
                                <thead>
                                    <tr>
                                        <th>{_("Name")}</th>
                                        <th>{_("Intranet Host")}</th>
                                        <th>{_("Initial Account")}</th>
                                        <th>{_("Password")}</th>
                                        <th>{_("Recommended Tool")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dbArray.map((db, index) => {
                                        const isPasswordVisible = visiblePasswords[index];
                                        return (
                                            <tr key={index}>
                                                <td style={{ verticalAlign: 'middle' }}>{db?.name}</td>
                                                <td style={{ verticalAlign: 'middle' }}>{db?.host}</td>
                                                <td style={{ verticalAlign: 'middle' }}>{dbConfig[db?.name].account}</td>
                                                <td style={{ display: "flex", alignItems: "center" }}>
                                                    <span class="password-span">
                                                        {isPasswordVisible ? db?.password : '•'.repeat(db?.password?.length || 0)}
                                                    </span>

                                                    <IconButton
                                                        onClick={() => togglePasswordVisibility(index)}
                                                        edge="end"
                                                    >
                                                        {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                    <IconButton title='Copy' onClick={() => copyToClipboard(db?.password)}>
                                                        <FileCopyIcon />
                                                    </IconButton>
                                                </td>
                                                <td style={{ verticalAlign: 'middle' }}>{dbConfig[db?.name]?.tool}</td>
                                            </tr>
                                        );
                                    })}
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

export default AppDatabases;