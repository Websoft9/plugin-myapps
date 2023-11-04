import cockpit from "cockpit";
import React from 'react';
import { Button, Card, Col, Row, Table } from 'react-bootstrap';

const _ = cockpit.gettext;

const AppVolume = (props): React$Element<React$FragmentType> => {
    const volumesInfo = props.data.volumes || [];
    const endpointId = props.data.endpointId;

    return (
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
                                    let url = `container#/w9deployment/#!/${endpointId}/docker/volumes`;
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
                                {volumesInfo.map((volume, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <a href="#" onClick={(e) => {
                                                    e.preventDefault();
                                                    let url = `container#/w9deployment/#!/${endpointId}/docker/volumes/${volume?.Name}`;
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
        </Row >
    );
}

export default AppVolume;