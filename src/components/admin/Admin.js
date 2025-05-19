import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AdminView = () => {
    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card style={{ maxWidth: '400px', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Card.Body className="text-center">
                    <Card.Title className="mb-4">Panel de Administrador</Card.Title>
                    <Row className="mb-3">
                        <Col>
                            <Button variant="primary" block="true">
                                Opción 1
                            </Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button variant="info" block="true">
                                Ver Tareas Asignadas
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminView;