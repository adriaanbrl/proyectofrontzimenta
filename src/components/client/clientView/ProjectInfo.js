import React from "react";
import { Col, Card, ListGroup } from "react-bootstrap";
import { BsGeoAltFill, BsCalendarFill, BsClockFill } from "react-icons/bs";
import "./PrrojectInfo.css";

const ProjectInfo = ({
  buildingAddress,
  formattedBuildingStartDate,
  formattedBuildingEndDate,
}) => {
  return (
    <Col md={12}>
      <h2 className="fs-4 fw-bold text-start mb-3 ">INFORMACIÓN</h2>
      <Card className="shadow-sm project-info-card">
        <Card.Body className="p-0">
          <ListGroup variant="flush">
            <ListGroup.Item className="d-flex align-items-center project-info-item">
              <BsGeoAltFill className="me-3 project-info-icon" size={20} />
              <div className="flex-grow-1">
                {" "}
                <div className="fw-bold project-info-label">Dirección</div>
                <div className="text-muted project-info-value">
                  {buildingAddress || "Dirección no disponible"}
                </div>
              </div>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex align-items-center project-info-item">
              <BsCalendarFill className="me-3 project-info-icon" size={20} />
              <div className="flex-grow-1">
                {" "}
                <div className="fw-bold project-info-label">
                  Fecha de inicio
                </div>
                <div className="text-muted project-info-value">
                  {formattedBuildingStartDate}
                </div>
              </div>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex align-items-center project-info-item">
              <BsClockFill className="me-3 project-info-icon" size={20} />
              <div className="flex-grow-1">
                {" "}
                <div className="fw-bold project-info-label">
                  Fecha de fin prevista
                </div>
                <div className="text-muted project-info-value">
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
