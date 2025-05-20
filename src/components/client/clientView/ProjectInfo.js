import React from "react";
import { Col, Card, ListGroup } from "react-bootstrap";
import { GeoAltFill, CalendarFill } from "react-bootstrap-icons";

const ProjectInfo = ({
                         buildingAddress,
                         formattedBuildingStartDate,
                         formattedBuildingEndDate,
                     }) => {
    return (
        <Col md={12}>
            <h2 className="fs-4 fw-bold text-start mb-3">INFORMACIÓN</h2>
            <Card className="shadow-sm">
                <Card.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex align-items-center">
                            <GeoAltFill className="me-2 text-secondary" size={20} />
                            <div>
                                <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                                    Dirección
                                </div>
                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                    {buildingAddress || "Dirección no disponible"}
                                </div>
                            </div>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex align-items-center">
                            <CalendarFill className="me-2 text-secondary" size={20} />
                            <div>
                                <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                                    Fecha de inicio
                                </div>
                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                    {formattedBuildingStartDate}
                                </div>
                            </div>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex align-items-center">
                            <CalendarFill className="me-2text-secondary" size={20} />
                            <div>
                                <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                                    Fecha de fin prevista
                                </div>
                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                    {formattedBuildingEndDate}
                                </div>
                            </div>
                        </ListGroup.Item>
                    </ListGroup>
                </Card.Body>
            </Card>
        </Col>
    );
};

export default ProjectInfo;