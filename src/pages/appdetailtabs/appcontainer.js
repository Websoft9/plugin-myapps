import cockpit from "cockpit";
import React from 'react';
import { Badge, Button, Card, Col, OverlayTrigger, Row, Table, Tooltip } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const _ = cockpit.gettext;

const AppContainer = (props): React$Element<React$FragmentType> => {
    const navigate = useNavigate(); //用于页面跳转
    const containersInfo = props.containersInfo;
    const customer_name = props.customer_name;
    const endpointsId = props.endpointsId;

    return (
        <Row>
            <Col xs={12}>
                <Card>
                    <Card.Header>
                        <Row className="align-items-center">
                            <Col xs={12} md={10}>
                                <label className="me-2 fs-5 d-block">{_("Container")}</label>
                                <span className="me-2 fs-6">
                                    {cockpit.format(_("This application consists of the following containers, and the one named $0 is the main container."), customer_name)}
                                </span>
                            </Col>
                            <Col xs={12} md={2}>
                                {/* <a href={`/portainer/#!/${endpointsId}/docker/stacks/${customer_name}?type=2&regular=false&external=true&orphaned=false`}
                                    target="_parent" className="me-2">
                                    <Button variant="primary" size="sm" className="float-end">{_("More")}</Button>
                                </a> */}
                                <Button variant="primary" size="sm" className="float-end me-2" onClick={() => {
                                    let url = `container#/portainer/#!/${endpointsId}/docker/stacks/${customer_name}?type=2&regular=false&external=true&orphaned=false`;
                                    cockpit.file('/etc/hostname').watch(content => {
                                        console.log(content);
                                    });
                                    cockpit.jump(url);
                                }}>{_("More")}</Button>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <Table className="mb-0">
                            <thead>
                                <tr>
                                    <th>{_("Name")}</th>
                                    <th>{_("State")}</th>
                                    <th style={{ textAlign: 'center' }}>{_("Actions")}</th>
                                    <th>{_("Image")}</th>
                                    <th>{_("Created")}</th>
                                    <th>{_("Ip Address")}</th>
                                    <th>{_("Published Ports")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {containersInfo.map((container, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{container.Names?.[0]?.replace(/^\/|\/$/g, '')}</td>
                                            <td>
                                                <Badge className={`${container.State === 'running' ? 'bg-success' : container.State === 'exited' ? 'bg-danger' : 'info'}`}>
                                                    {container.State}
                                                </Badge>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <a href="#" onClick={(e) => {
                                                    e.preventDefault();
                                                    let url = `container#/portainer/#!/${endpointsId}/docker/containers/${container.Id}/logs`;
                                                    cockpit.file('/etc/hostname').watch(content => {
                                                        console.log(content);
                                                    });
                                                    cockpit.jump(url);
                                                }}
                                                    title='Logs'>
                                                    <i className="dripicons-document-remove noti-icon"></i>{' '}
                                                </a>
                                                {
                                                    container.State === "running" && (
                                                        <a href="#" onClick={(e) => {
                                                            e.preventDefault();
                                                            let url = `container#/portainer/#!/${endpointsId}/docker/containers/${container.Id}/stats`;
                                                            cockpit.file('/etc/hostname').watch(content => {
                                                                console.log(content);
                                                            });
                                                            cockpit.jump(url);
                                                        }} title='Stats'>
                                                            <i className="dripicons-graph-bar noti-icon"></i>{' '}
                                                        </a>
                                                    )
                                                }
                                                {
                                                    container.State === "running" && (
                                                        <a href="#" onClick={(e) => {
                                                            e.preventDefault();
                                                            let url = `container#/portainer/#!/${endpointsId}/docker/containers/${container.Id}/exec`;
                                                            cockpit.file('/etc/hostname').watch(content => {
                                                                console.log(content);
                                                            });
                                                            cockpit.jump(url);
                                                        }} title='Exec Console'>
                                                            <i className="dripicons-code noti-icon"></i>{' '}
                                                        </a>
                                                    )
                                                }
                                            </td>
                                            {/* <td>{container.Image}</td> */}
                                            <td>
                                                <OverlayTrigger
                                                    key="bottom1"
                                                    placement="bottom"
                                                    overlay={
                                                        <Tooltip id="tooltip-bottom">
                                                            {container.Image}
                                                        </Tooltip>
                                                    }>
                                                    <div>{container.Image?.length > 20 ? container.Image.substring(0, 20) + "..." : container.Image}</div>
                                                </OverlayTrigger>

                                            </td>
                                            <td>{new Date(container.Created * 1000).toLocaleString()}</td>
                                            <td>{container.NetworkSettings.Networks[container.HostConfig.NetworkMode].IPAddress}</td>
                                            <td>{container.Ports.find(port => port.IP && /^(\d{1,3}\.){3}\d{1,3}$/.test(port.IP))?.PublicPort}:{container.Ports.find(port => port.IP && /^(\d{1,3}\.){3}\d{1,3}$/.test(port.IP))?.PrivatePort}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>
        </Row >
    );
}

export default AppContainer;