import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Autocomplete, Chip, Grid, IconButton, TextField } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import classNames from 'classnames';
import cockpit from 'cockpit';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import Spinner from '../components/Spinner';
import { AppDomainCreateByAppID, AppDomainDeleteByProxyID, AppDomainUpdateByProxyID } from '../helpers';

const _ = cockpit.gettext;

const MyMuiAlert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function HoverableChip({ label, ...props }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <a href={`http://${label}`} target="_blank" className="domian_link"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <Chip size="small" variant="outlined" label={label} className={isHovered ? 'chip-hover' : ''} {...props} />
        </a>
    );
}

const DeleteDomainConform = (props) => {
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [showCloseButton, setShowCloseButton] = useState(true);//用于是否显示关闭按钮
    const [alertType, setAlertType] = useState("");  //用于确定弹窗的类型：error\success

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
                    <h4>{_("Delete domain binding")}</h4>
                </Modal.Header>
                <Modal.Body className="row" >
                    <span style={{ margin: "10px 0px" }}>{_("Are you sure you want to delete the domain for:")}</span>
                    <span style={{ fontWeight: 'bold' }}>{props.domains.join(", ")}{" ?"}</span>
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
                        try {
                            await AppDomainDeleteByProxyID(props.proxy_id);
                            props.onDataChange();
                            props.onClose();
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
                        {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Delete")}
                    </Button>
                </Modal.Footer>
            </Modal >
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

const UpdateDomainConform = (props) => {
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [showCloseButton, setShowCloseButton] = useState(true);//用于是否显示关闭按钮
    const [alertType, setAlertType] = useState("");  //用于确定弹窗的类型：error\success

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
                    <h4>{_("Update domain binding")}</h4>
                </Modal.Header>
                <Modal.Body className="row" >
                    <span style={{ margin: "10px 0px" }}>{_("Are you sure you want to update the domain for:")}</span>
                    <span style={{ fontWeight: 'bold' }}>{props.domains.join(", ")}{" ?"}</span>
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
                        try {
                            await AppDomainUpdateByProxyID(props.proxy_id, null, { "domain_names": props.domains });
                            props.closeEdit();
                            props.onDataChange();
                            props.onClose();
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
                        {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Update")}
                    </Button>
                </Modal.Footer>
            </Modal >
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

const AddDomainConform = (props) => {
    const [disable, setDisable] = useState(false);//用于按钮禁用
    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [showCloseButton, setShowCloseButton] = useState(true);//用于是否显示关闭按钮
    const [alertType, setAlertType] = useState("");  //用于确定弹窗的类型：error\success

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
                    <h4>{_("Add domain binding")}</h4>
                </Modal.Header>
                <Modal.Body className="row" >
                    <span style={{ margin: "10px 0px" }}>
                        {_("Are you sure you want to add the domain for:")}
                    </span>
                    <span style={{ fontWeight: 'bold' }}>{props.domains.join(", ")}{" ?"}</span>
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
                        try {
                            await AppDomainCreateByAppID(props.app_id, null, { "domain_names": props.domains });
                            props.onDataChange();
                            props.onDeleteRow();
                            props.onClose();
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
                        {disable && <Spinner className="spinner-border-sm me-1" tag="span" color="white" />} {_("Add")}
                    </Button>
                </Modal.Footer>
            </Modal >
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

const TagsInput = forwardRef(({
    app_id, proxy_id,
    initialTags = [],
    initialOptions = [],
    newlyAdded = false,
    defaultEditable = false,
    onDeleteRow,
    onSaveRow,
    onDataChange
}, ref): React$Element<React$FragmentType> => {
    const [tags, setTags] = useState(initialTags);
    const [tempTags, setTempTags] = useState(initialTags);
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isEditable, setIsEditable] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [latestInitialTags, setLatestInitialTags] = useState(initialTags);
    const [isNewlyAddedEditable, setIsNewlyAddedEditable] = useState(false);
    const [showRemoveDomain, setShowRemoveDomain] = useState(false); //用于是否显示删除域名的弹窗
    const [showUpdateDomain, setShowUpdateDomain] = useState(false); //用于是否显示更新域名的弹窗
    const [showAddDomain, setShowAddDomain] = useState(false); //用于是否显示添加域名的弹窗
    const [currentProxyId, setCurrentProxyId] = useState(null); //用于判断是否是当前的proxy_id
    const initialTagsRef = useRef(initialTags);
    const inputRef = useRef();

    const [showAlert, setShowAlert] = useState(false); //用于是否显示错误提示
    const [alertMessage, setAlertMessage] = useState("");//用于显示错误提示消息
    const [alertType, setAlertType] = useState("");  //用于确定弹窗的类型：error\success


    const options = useMemo(() => {
        const optionsToExclude = new Set(tempTags);
        const optionsToAdd = initialTags.filter(tag => !optionsToExclude.has(tag));
        return initialOptions.filter(option => !optionsToExclude.has(option)).concat(optionsToAdd);
    }, [tempTags, initialOptions, initialTags]);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowAlert(false);
        setAlertMessage("");
    };

    const handleDeleteTag = useCallback((tagToDelete) => () => {
        if (isEditable) {
            setTempTags((tags) => tags.filter((tag) => tag !== tagToDelete));
            setInputValue('');
            inputRef.current.focus();
        }
    }, [isEditable]);

    const handleChange = useCallback((event, newValue) => {
        if (isEditable) {
            setTempTags(newValue.map(value => value.startsWith('Add ') ? value.slice(4) : value));
        }
    }, [isEditable]);

    const handleEditClick = useCallback(() => {
        setIsEditable(true);
        setTempTags(tags);
    }, [tags]);


    const handleAddDomainSaveClick = useCallback(async () => {
        if (tempTags.length === 0) {
            setAlertType("error");
            setShowAlert(true);
            setAlertMessage(_("Domain name cannot be empty"));
            inputRef.current.focus();
        } else {
            setShowAddDomain(true);
            setTags(tempTags);
        }
    }, [tempTags]);

    const handleAddCloseClick = useCallback(() => {
        setShowAddDomain(false)
    }, []);

    const handleCancelClick = useCallback(() => {
        setIsEditable(false);
        setTempTags(tags);
    }, [tags]);

    const handleDeleteClick = useCallback(() => {
        setShowRemoveDomain(true);
        setCurrentProxyId(proxy_id);
    }, [proxy_id]);

    const handleCloseClick = useCallback(() => {
        setShowRemoveDomain(false)
    }, []);

    const handleUpdateClick = useCallback(() => {
        if (tempTags.length === 0) {
            inputRef.current.focus();
            setAlertType("error");
            setShowAlert(true);
            setAlertMessage(_("Please enter a domain name"));
        } else {
            setShowUpdateDomain(true);
            setCurrentProxyId(proxy_id);
        }
    }, [tempTags]);

    const handleUpdateCloseClick = useCallback(() => {
        setShowUpdateDomain(false)
    }, []);

    const handleDeleteRowClick = useCallback(() => {
        if (onDeleteRow) {
            onDeleteRow();
        }
    }, [onDeleteRow]);

    const deletedInitialTagsExist = useMemo(() => {
        return initialTags.some(tag => !tempTags.includes(tag));
    }, [tempTags, initialTags]);

    useEffect(() => {
        setLatestInitialTags(initialTags);
    }, [initialTags]);

    useEffect(() => {
        if (!isEditable) {
            setTags(latestInitialTags);
            setTempTags(latestInitialTags);
        }
    }, [isEditable, latestInitialTags]);

    useEffect(() => {
        if (newlyAdded && defaultEditable) {
            setIsEditable(true);
            setIsNewlyAddedEditable(true);
        }
    }, [newlyAdded, defaultEditable]);

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current.focus();
        },
    }));

    useEffect(() => {
        initialTagsRef.current = initialTags;
    }, [initialTags]);


    useEffect(() => {
        if (currentProxyId !== null && currentProxyId !== proxy_id) {
            setShowRemoveDomain(false);
            setCurrentProxyId(null);
        }
    }, [proxy_id, currentProxyId]);


    return (
        <>
            <Grid container direction="row" alignItems="center">
                <Grid item xs>
                    <Autocomplete
                        multiple
                        freeSolo
                        options={options}
                        value={tempTags}
                        inputValue={inputValue}
                        onInputChange={(event, newInputValue) => {
                            if (isEditable) {
                                setInputValue(newInputValue);
                            }
                        }}
                        onChange={handleChange}
                        filterOptions={(options, params) => {
                            const filtered = options.filter((option) =>
                                option.toLowerCase().includes(params.inputValue.toLowerCase())
                            );

                            if (params.inputValue !== '' && !options.includes(params.inputValue) && !tags.includes(params.inputValue)) {
                                filtered.push("Add " + params.inputValue);
                            }

                            return filtered;
                        }}
                        renderOption={(props, option, { inputValue }) => (
                            <li {...props} style={{ backgroundColor: option.includes(inputValue) ? '#f0f0f0' : 'white' }}>
                                {option}
                            </li>
                        )}
                        disabled={!isEditable}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                isEditable ? (
                                    <Chip size="small" variant="outlined" label={option} {...getTagProps({ index })} onDelete={handleDeleteTag(option)} />
                                ) : (
                                    <HoverableChip label={option} />
                                )
                            ))
                        }
                        renderInput={(params) => (
                            <TextField {...params} size="small" variant="outlined" InputProps={{ ...params.InputProps, endAdornment: null }} inputRef={inputRef} />
                        )}
                        openOnFocus
                        onBlur={() => setIsOpen(false)}
                        onFocus={() => setIsOpen(true)}
                        open={isOpen && (deletedInitialTagsExist || inputValue.length > 0)}
                    />
                </Grid>
                <Grid item>
                    {isEditable ? (
                        isNewlyAddedEditable ? (
                            <React.Fragment>
                                <IconButton onClick={handleAddDomainSaveClick}>
                                    <SaveIcon />
                                </IconButton>
                                <IconButton onClick={handleDeleteRowClick}>
                                    <DeleteIcon />
                                </IconButton>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <IconButton onClick={handleUpdateClick}>
                                    <SaveIcon />
                                </IconButton>
                                <IconButton onClick={handleCancelClick}>
                                    <CancelIcon />
                                </IconButton>
                            </React.Fragment>
                        )
                    ) : (
                        newlyAdded ? (
                            <React.Fragment>
                                <IconButton onClick={handleAddDomainSaveClick}>
                                    <SaveIcon />
                                </IconButton>
                                <IconButton onClick={handleDeleteRowClick}>
                                    <DeleteIcon />
                                </IconButton>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <IconButton onClick={handleEditClick}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={handleDeleteClick}>
                                    <DeleteIcon />
                                </IconButton>
                            </React.Fragment>
                        )
                    )}
                </Grid>
            </Grid>
            {
                showAddDomain &&
                <AddDomainConform app_id={app_id} domains={tempTags} onDeleteRow={onDeleteRow}
                    showConform={handleAddDomainSaveClick} onClose={handleAddCloseClick} onDataChange={onDataChange} />
            }
            {
                showRemoveDomain &&
                <DeleteDomainConform proxy_id={proxy_id} domains={tags} showConform={handleDeleteClick} onClose={handleCloseClick} onDataChange={onDataChange} />
            }
            {
                showUpdateDomain &&
                <UpdateDomainConform proxy_id={proxy_id} domains={tempTags}
                    showConform={handleUpdateClick} onClose={handleUpdateCloseClick} onDataChange={onDataChange}
                    closeEdit={handleCancelClick}
                />
            }
            {
                showAlert &&
                <Snackbar open={showAlert} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <MyMuiAlert onClose={handleClose} severity={alertType} sx={{ width: '100%' }}>
                        {alertMessage}
                    </MyMuiAlert>
                </Snackbar>
            }
        </>
    );
});

export default TagsInput;
