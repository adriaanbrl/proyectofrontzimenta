import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Si quieres que los botones naveguen

const WorkerView = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Card style={{ maxWidth: '400px', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Card.Body className="text-center">
                    <Card.Title className="mb-4">Panel de Empleado</Card.Title>
                    <Row className="mb-3">
                        <Col>
                            <Button variant="info" block>
                                Ver Tareas Asignadas
                            </Button>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col>
                            <Button variant="warning" block>
                                Reportar Incidencia
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button variant="secondary" block>
                                Consultar Horario
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default WorkerView;