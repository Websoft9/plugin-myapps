import cockpit from "cockpit";
import React from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';

const _ = cockpit.gettext;

const AppOverview = (props): React$Element<React$FragmentType> => {
    return (
        <Row>
            <Col xs={12}>
                <Card>
                    <Card.Header>
                        <label className="me-2 fs-5 d-block">{_("App Overview")}</label>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive className="mb-0" bordered={false} style={{ display: 'flex' }}>
                            <tbody>
                                <tr>
                                    <td style={{ fontWeight: "bold" }}>{_("App Id")}:</td>
                                    <td>{props.data?.app_id}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: "bold" }}>{_("App Name")}:</td>
                                    <td>{props.data?.app_name}</td>
                                </tr>
                                <tr>
                                    <td style={{ fontWeight: "bold" }}>{_("App Version")}:</td>
                                    <td>{props.data?.app_version}</td>
                                </tr>
                                {/* <tr>
                                    <td style={{ fontWeight: "bold" }}>{_("App Port")}:</td>
                                    <td>{props.data?.app_port}</td>
                                </tr> */}
                                {
                                    Object.entries(props.data?.env || {}).map(([key, value]) => {
                                        if (key.endsWith("PORT_SET")) {
                                            return (
                                                <tr key={key}>
                                                    <td style={{ fontWeight: "bold" }}>{_(key)}:</td>
                                                    <td>{value}</td>
                                                </tr>
                                            );
                                        }
                                        return null;
                                    })
                                }
                                <tr>
                                    <td style={{ fontWeight: "bold" }}>{_("Created Time")}:</td>
                                    <td>
                                        {props.data?.creationDate
                                            ? new Date(props.data.creationDate * 1000).toLocaleString()
                                            : null}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default AppOverview;