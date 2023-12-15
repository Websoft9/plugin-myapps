import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { IconButton } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import cockpit from 'cockpit';
import { default as React, useCallback, useRef, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import TagsInput from '../../components/TagsInput';

const _ = cockpit.gettext;

const MyMuiAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const AppAccess = (props): React$Element<React$FragmentType> => {
    const navigate = useNavigate(); //用于页面跳转
    // const [domains, setDomains] = useState([]); // 定义域名数组
    const [loading, setLoading] = useState(false); // 定义执行操作时的加载转态
    const [newDomainRows, setNewDomainRows] = useState([]); // 定义新增的域名数组
    const [addingRow, setAddingRow] = useState(false); // 用于判断是否正在新增一行

    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");  //用于显示错误提示消息
    const [alertType, setAlertType] = useState("");  //用于确定弹窗的类型：error\success
    const [deleteRowData, setDeleteRowData] = useState(null); //用于保存将要删除的行数据
    const [inputDomainValue, setInputDomainValue] = useState("");//用户保存用户输入的域名

    const [isExpandedForDomain, setIsExpandedForDomain] = React.useState(true); //用于保存“域名绑定”的折叠状态
    const [isExpandedForNoDomain, setIsExpandedForNoDomain] = React.useState(true);//用于保存“无域名访问”的折叠状态
    //const [isExpandedForAccount, setIsExpandedForAccount] = React.useState(false);//用于保存“初始账号”的折叠状态
    const baseURL = `${window.location.protocol}//${window.location.hostname}`;

    let domains = props?.data?.domain_names;
    domains = [...domains].sort((a, b) => a.id - b.id);
    const env = props?.data?.env;
    const app_port = props?.data?.env?.W9_HTTP_PORT_SET
    const is_web_app = !!props?.data?.env?.W9_URL; //判断是否是web应用
    const w9_url = props?.data?.env?.W9_URL;

    const [isExpandedForAccount, setIsExpandedForAccount] = React.useState(!is_web_app ? true : false);

    const tagsInputRef = useRef();

    //密码复制
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

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    const handleChangefordomin = (event, newExpanded) => {
        setIsExpandedForDomain(newExpanded);
    };

    const handleChangefornodomin = (event, newExpanded) => {
        setIsExpandedForNoDomain(newExpanded);
    };

    const handleChangeforaccount = (event, newExpanded) => {
        setIsExpandedForAccount(newExpanded);
    };

    //新增一行域名
    const addDominRow = () => {
        if (!addingRow) {
            setNewDomainRows(prevRows => [...prevRows, { domain_names: [] }]);
            setAddingRow(true);
        }
        else {
            tagsInputRef.current.focus();
        }
    }

    //保存一行（新增）域名
    const handleSaveRow = useCallback((index) => {
        setAddingRow(false);
    }, []);

    //删除一行（新增）域名
    const deletDomaineRow = useCallback((index) => {
        setNewDomainRows((prevRows) => prevRows.filter((_, i) => i !== index));
        setAddingRow(false);
    }, []);

    return (
        <>
            <Card>
                {loading && (
                    <div className="card-disabled" style={{ zIndex: 999 }}>
                        <div className="card-portlets-loader"></div>
                    </div>
                )}
                <Card.Body>
                    {
                        is_web_app &&
                        <Accordion /*defaultExpanded={true}*/ expanded={true} /*onChange={handleChangefordomin}*/ className='mb-2'>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>
                                    <label className="me-2 fs-5 d-block">{_("Domain Access")}</label>
                                    <span className="me-2 fs-6" style={{ display: isExpandedForDomain ? 'inline' : 'none' }}>
                                        {_("Access the domain name for better application performance, https and custom configuration can click")}
                                        {" "}
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault();
                                            let url = `nginx#/w9proxy/nginx/proxy`;
                                            cockpit.file('/etc/hosts').watch(content => {
                                                cockpit.jump(url);
                                            });
                                        }} >
                                            {_("more")}
                                        </a>
                                    </span>
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    <Card>
                                        <Card.Header>
                                            <Row className="mb-2 align-items-center">
                                                <Col xs={12} md={12} className="d-flex justify-content-end">
                                                    {
                                                        domains.length === 0 &&
                                                        <Button variant="primary" size="sm" className="me-2" onClick={() => { addDominRow(); }}>{_("Add Domain")}</Button>
                                                    }
                                                    {
                                                        domains.length > 0 && w9_url && env.W9_ADMIN_PATH && (
                                                            <a href={"http://" + w9_url + env.W9_ADMIN_PATH} target="_blank" className="me-2">
                                                                <Button variant="primary" size="sm">{_("Admin Page")}</Button>
                                                            </a>
                                                        )
                                                    }
                                                </Col>
                                            </Row>
                                        </Card.Header>
                                        <Card.Body>
                                            {domains.map((row, index) => (
                                                <Row className="mb-2" key={index}>
                                                    <Col xs={12} className="d-flex justify-content-between">
                                                        <Col>
                                                            <TagsInput initialTags={row?.domain_names} proxy_id={row?.id} onDataChange={props.onDataChange} />
                                                        </Col>
                                                    </Col>
                                                </Row>
                                            ))}

                                            {newDomainRows.map((row, index) => (
                                                <Row className="mb-2" key={index}>
                                                    <Col xs={12} className="d-flex justify-content-between">
                                                        <Col>
                                                            <TagsInput initialTags={row.domain_names}
                                                                app_id={props?.data?.app_id}
                                                                newlyAdded
                                                                defaultEditable
                                                                ref={tagsInputRef}
                                                                onSaveRow={() => handleSaveRow(index)}
                                                                onDeleteRow={() => deletDomaineRow(index)}
                                                                onDataChange={props.onDataChange}
                                                            />
                                                        </Col>
                                                    </Col>
                                                </Row>
                                            ))}
                                        </Card.Body>
                                    </Card >
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    }
                    {
                        is_web_app && domains.length === 0 && env && app_port &&
                        <Accordion defaultExpanded={true} onChange={handleChangefornodomin} className='mb-2'>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel2a-content"
                                id="panel2a-header"
                            >
                                <Typography>
                                    <label className="me-2 fs-5 d-block">{_("No Domain Access")}</label>
                                    <span className="me-2 fs-6" style={{ display: isExpandedForNoDomain ? 'inline' : 'none' }}>
                                        {_("No domain name can temporarily access the application by IP + port")}
                                    </span>
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    <Card>
                                        <Card.Body>
                                            <div>
                                                <label className="me-2 fs-5">{_("Frontend")}:</label>
                                                <a href={`${baseURL}:${app_port}`} target="_blank" className="me-2">
                                                    {`${baseURL}:${app_port}`}
                                                </a>
                                            </div>
                                            {
                                                env.W9_ADMIN_PATH && (
                                                    <div>
                                                        <label className="me-2 fs-5">{_("Backend")}:</label>
                                                        <a href={`${baseURL}:${app_port}${env?.W9_ADMIN_PATH}`} target="_blank" className="me-2">
                                                            {`${baseURL}:${app_port}${env?.W9_ADMIN_PATH}`}
                                                        </a>
                                                    </div>
                                                )
                                            }

                                        </Card.Body>
                                    </Card>
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    }
                    {
                        env && Object.keys(env).some(key => key.startsWith('W9_LOGIN')) &&
                        <Accordion defaultExpanded={!is_web_app ? true : false} className='mb-2' onChange={handleChangeforaccount}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel3a-content"
                                id="panel3a-header"
                            >
                                <Typography>
                                    <label className="me-2 fs-5 d-block">{_("Initial Account")}</label>
                                    <span className="me-2 fs-6" style={{ display: isExpandedForAccount ? 'inline' : 'none' }}>
                                        {_("This application is pre-configured with an administrator account, please change the administrator password immediately. The initial credentials are:")}
                                    </span>
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>
                                    <Card>
                                        <Card.Body>
                                            {Object.keys(env)
                                                .filter(key => key.startsWith('W9_LOGIN'))
                                                .sort((a, b) => {
                                                    if (a.includes('PASSWORD') || b.includes('PASSWORD')) {
                                                        if (a.includes('PASSWORD') && b.includes('PASSWORD')) return 0;
                                                        return a.includes('PASSWORD') ? 1 : -1;
                                                    }
                                                    if (a.includes('USER') || b.includes('USER')) {
                                                        if (a.includes('USER') && b.includes('USER')) return 0;
                                                        return a.includes('USER') ? 1 : -1;
                                                    }
                                                    return 0;
                                                })
                                                .map((key, index) => {
                                                    const isPassword = key.includes('PASSWORD');
                                                    return (
                                                        <Form.Group as={Row} className="mb-3" key={index}>
                                                            <Form.Label htmlFor={key} column md={2} className='fs-5'>
                                                                {_(key)}
                                                            </Form.Label>
                                                            <Col md={4}>
                                                                {isPassword ? (
                                                                    <FormInput
                                                                        type="password"
                                                                        name={key}
                                                                        containerClass={'mb-3'}
                                                                        value={env[key]}
                                                                        readOnly
                                                                    />
                                                                ) : (
                                                                    <Form.Control
                                                                        type="text"
                                                                        name={key}
                                                                        id={key}
                                                                        defaultValue={env[key]}
                                                                        readOnly
                                                                    />
                                                                )}
                                                            </Col>
                                                            {isPassword &&
                                                                <Col md={1}>
                                                                    <IconButton title='Copy' onClick={() => copyToClipboard(env[key])}>
                                                                        <FileCopyIcon />
                                                                    </IconButton>
                                                                </Col>
                                                            }
                                                        </Form.Group>
                                                    );
                                                })
                                            }
                                        </Card.Body>
                                    </Card>
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    }
                </Card.Body>
            </Card >
            {
                showAlert &&
                <Snackbar open={showAlert} autoHideDuration={3000} onClose={handleAlertClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleAlertClose} severity={alertType} sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            }
        </>
    );
}

export default AppAccess;