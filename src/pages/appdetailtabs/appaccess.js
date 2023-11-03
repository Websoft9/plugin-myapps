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
    const [isExpandedForAccount, setIsExpandedForAccount] = React.useState(false);//用于保存“无域名访问”的折叠状态

    const protocol = window.location.protocol;
    const host = window.location.host;
    const baseURL = protocol + "//" + (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(host) ? host.split(":")[0] : host);

    let domains = props?.data?.domain_names;
    domains = [...domains].sort((a, b) => a.id - b.id);
    const env = props?.data?.env;
    const app_port = props?.data?.app_port;

    const tagsInputRef = useRef();

    //密码复制
    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                setShowAlert(true);
                setAlertMessage(_("Password copied successfully"));
                setAlertType("success");
            }).catch(err => {
                setShowAlert(true);
                setAlertMessage(_("Password copied failed"));
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
                setAlertMessage(_("Password copied successfully"));
                setAlertType("success");
            }
            catch (err) {
                setShowAlert(true);
                setAlertMessage(_("Password copied failed"));
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

                                        });
                                        cockpit.jump(url);
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
                                                    domains.length > 0 && domains[0].domain_names && env.APP_ADMIN_PATH && (
                                                        <a href={"http://" + domains[0].domain_names[domains[0].domain_names.length - 1] + env.APP_ADMIN_PATH} target="_blank" className="me-2">
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
                                                        <TagsInput initialTags={row?.domain_names} proxy_id={row?.id} />
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
                                                            onDeleteRow={() => deletDomaineRow(index)} />
                                                    </Col>
                                                </Col>
                                            </Row>
                                        ))}
                                    </Card.Body>
                                </Card >
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                    {
                        domains.length === 0 && env &&
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
                                                <label className="me-2 fs-5">{_("Front End")}:</label>
                                                <a href={`${baseURL}:${app_port}`} target="_blank" className="me-2">
                                                    {`${baseURL}:${app_port}`}
                                                </a>
                                            </div>
                                            {
                                                env.APP_ADMIN_PATH && (
                                                    <div>
                                                        <label className="me-2 fs-5">{_("Back End")}:</label>
                                                        <a href={`${baseURL}:${app_port}${env?.APP_ADMIN_PATH}`} target="_blank" className="me-2">
                                                            {`${baseURL}:${app_port}${env?.APP_ADMIN_PATH}`}
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
                        env && env.APP_USER && env.APP_PASSWORD &&
                        <Accordion className='mb-2' onChange={handleChangeforaccount}>
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
                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label htmlFor="username" column md={2} className='fs-5'>
                                                    {_("UserName")}
                                                </Form.Label>
                                                <Col md={4}>
                                                    <Form.Control
                                                        type="text"
                                                        name="username"
                                                        id="username"
                                                        defaultValue={env.APP_USER}
                                                        readOnly
                                                    />
                                                </Col>
                                            </Form.Group>

                                            <Form.Group as={Row} className="mb-3">
                                                <Form.Label htmlFor="password" column md={2} className='fs-5'>
                                                    {_("Password")}
                                                </Form.Label>
                                                <Col md={4}>
                                                    <FormInput
                                                        type="password"
                                                        name="password"
                                                        containerClass={'mb-3'}
                                                        value={env.APP_PASSWORD}
                                                        readOnly
                                                    />
                                                </Col>
                                                <Col md={1}>
                                                    <IconButton title='Copy' onClick={() => copyToClipboard(env.APP_PASSWORD)}>
                                                        <FileCopyIcon />
                                                    </IconButton>
                                                </Col>
                                            </Form.Group>
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