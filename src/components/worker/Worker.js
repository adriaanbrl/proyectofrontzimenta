import React, { useState } from 'react';
import { Card, Button, Accordion, Row, Col, Form, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Si quieres que los botones naveguen
import { PencilSquare } from 'react-bootstrap-icons'; // O cualquier otro icono que desees

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
        // Más información o un estado para la construcción
    },
    // Añade más construcciones según sea necesario
];

const ProfileImage = ({ imageUrl, onImageChange }) => (
    <div className="position-relative d-inline-block ms-3">
        <Image
            src={imageUrl || 'https://via.placeholder.com/80'} // Imagen por defecto
            alt="Perfil del Trabajador"
            roundedCircle
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
        />
        <Form.Group className="position-absolute bottom-0 end-0 mb-1 me-1">
            <Form.Control
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="d-none"
                id="upload-profile-image"
            />
            <Form.Label htmlFor="upload-profile-image" className="bg-light border rounded-circle p-1" style={{ cursor: 'pointer' }}>
                <PencilSquare size={16} className="text-secondary" />
            </Form.Label>
        </Form.Group>
    </div>
);

const WorkerView = () => {
    const [workerImage, setWorkerImage] = useState(null);
    const workerName = "Nombre del Trabajador";
    const workerRole = "Trabajador";

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setWorkerImage(reader.result);
                // Aquí podrías guardar la imagen en tu backend o estado global
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container mt-4">
            <div className="bg-light p-4 rounded shadow-sm mb-4 d-flex align-items-center justify-content-between">
                <div className="text-start">
                    <h2 className="mb-0 text fw-bold">{workerName}</h2>
                    <p className="mb-0 text fw-bold">ROL:{workerRole}</p>
                </div>
                <ProfileImage imageUrl={workerImage} onImageChange={handleImageChange} />
            </div>
            <h4 className="mb-3 text-secondary">CONSTRUCCIONES ASOCIADAS:</h4>
            <Accordion defaultActiveKey="0">
                {constructionData.map((construction, index) => (
                    <Card key={construction.id} className="mb-3 shadow-sm">
                        <Accordion.Item eventKey={index.toString()}>
                            <Accordion.Header className="bg-white border-bottom">
                                <strong>{construction.nombre}</strong>
                                <span className="ms-2 text-muted">({construction.direccion})</span>
                            </Accordion.Header>
                            <Accordion.Body className="p-3">
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Subir Imágenes:</Col>
                                    <Col md={8}>
                                        <Button variant="btn btn-outline-custom" className="w-100">Subir</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Cambiar Estado:</Col>
                                    <Col md={8}>
                                        <Button variant="btn btn-outline-custom" className="w-100">Cambiar</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Eventos y Día:</Col>
                                    <Col md={8}>
                                        <Button variant="btn btn-outline-custom" className="w-100">Poner</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Documentación Legal:</Col>
                                    <Col md={8}>
                                        <Button variant="btn btn-outline-custom" className="w-100">Subir</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Facturas:</Col>
                                    <Col md={8}>
                                        <Button variant="btn btn-outline-custom" className="w-100">Subir</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Presupuestos:</Col>
                                    <Col md={8}>
                                        <Button variant="btn btn-outline-custom" className="w-100">Subir</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Manual Usuario:</Col>
                                    <Col md={8}>
                                        <Button variant="btn btn-outline-custom" className="w-100">Subir</Button>
                                    </Col>
                                </Row>
                                <Row className="mb-2 align-items-center">
                                    <Col md={4} className="text-muted">Historial Incidencias:</Col>
                                    <Col md={8}>
                                        <Button variant="btn btn-outline-custom" className="w-100">Ver</Button>
                                    </Col>
                                </Row>
                                <Row className="align-items-center">
                                    <Col md={4} className="text-muted">Estado Incidencia:</Col>
                                    <Col md={8}>
                                        <Button variant="btn btn-outline-custom" className="w-100">Cambiar</Button>
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