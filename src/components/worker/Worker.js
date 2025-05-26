import React from 'react';
import { Card, Button, Accordion, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Si quieres que los botones naveguen

const constructionData = [
    {
        id: 1,
        nombre: 'Edificio Residencial A',
        direccion: 'Calle Falsa 123, Valdemoro',
        // Aquí podrías tener más información o un estado para la construcción
    },
    {
        id: 2,
        nombre: 'Centro Comercial Nuevo',
        direccion: 'Avenida Principal s/n, Valdemoro',
        // Más información o estado
    },
    // Añade más construcciones según sea necesario
];

const WorkerView = () => {
    return (
        <div className="container mt-4">
            <div className="bg-light p-4 rounded shadow-sm mb-4">
                <h2 className="mb-3 text-primary">Bienvenido Nombre</h2>
                <p className="mb-0 text-muted">Rol: Trabajador</p>
            </div>
            <h4 className="mb-3 text-secondary">CONSTRUCCIONES ASOCIADAS:</h4>
            <Accordion defaultActiveKey="0">
                {constructionData.map((construction, index) => (
                    <Card key={construction.id} className="mb-3 shadow-sm">
                        <Accordion.Item eventKey={index.toString()}>
                            <Accordion.Header className="bg-white border-bottom">
                                <strong className="text-info">{construction.nombre}</strong>
                                <span className="ms-2 text-muted">({construction.direccion})</span>
                            </Accordion.Header>
                            <Accordion.Body className="p-3">
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Subir Imágenes:</Col>
                                    <Col md={8}>
                                        <Button variant="outline-primary" className="w-100">Subir</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Cambiar Estado:</Col>
                                    <Col md={8}>
                                        <Button variant="outline-info" className="w-100">Cambiar</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Eventos y Día:</Col>
                                    <Col md={8}>
                                        <Button variant="outline-warning" className="w-100">Poner</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Documentación Legal:</Col>
                                    <Col md={8}>
                                        <Button variant="outline-secondary" className="w-100">Subir</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Facturas:</Col>
                                    <Col md={8}>
                                        <Button variant="outline-success" className="w-100">Subir</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Presupuestos:</Col>
                                    <Col md={8}>
                                        <Button variant="outline-danger" className="w-100">Subir</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Manual Usuario:</Col>
                                    <Col md={8}>
                                        <Button variant="outline-dark" className="w-100">Subir</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Historial Incidencias:</Col>
                                    <Col md={8}>
                                        <Button variant="outline-primary" className="w-100">Ver</Button>
                                    </Col>
                                </Row>
                                <Row className="align-items-center">
                                    <Col md={4} className="text-muted">Estado Incidencia:</Col>
                                    <Col md={8}>
                                        <Button variant="outline-info" className="w-100">Cambiar</Button>
                                    </Col>
                                </Row>
                                {/* Aquí podrías añadir más opciones o información específica de la construcción */}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Card>
                ))}
            </Accordion>
        </div>
    );
};

export default WorkerView;