import React from 'react';
import { Col, Row } from 'react-bootstrap';

const AppSkeleton = ({ count = 6 }) => {
    return (
        <Row>
            {Array.from({ length: count }).map((_, index) => (
                <Col xxl={2} md={3} key={index} className="appstore-item">
                    <div className="appstore-item-content skeleton-card">
                        <div className="skeleton-header">
                            <div className="skeleton-icon"></div>
                        </div>
                        <div className="skeleton-image"></div>
                        <div className="skeleton-title"></div>
                        <div className="skeleton-badge"></div>
                    </div>
                </Col>
            ))}
        </Row>
    );
};

export default AppSkeleton;
