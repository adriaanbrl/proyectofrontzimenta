import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';

const IncidentEditModal = ({ show, onHide, incidentData, onSave, isLoading, error, setLoading, setError }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [newImage, setNewImage] = useState(null); 
    const [currentImageDisplay, setCurrentImageDisplay] = useState(''); 

    useEffect(() => {
        if (show && incidentData) {
            setTitle(incidentData.title || '');
            setDescription(incidentData.description || '');
            setNewImage(null); 
            setCurrentImageDisplay(incidentData.image ? `data:image/jpeg;base64,${incidentData.image}` : '');
            setError(null); 
        }
    }, [show, incidentData, setError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); 
        setError(null);   

        const formData = new FormData();
        formData.append('id', incidentData.id); 
        formData.append('title', title);
        formData.append('description', description);
        formData.append('buildingId', incidentData.buildingId); 


        if (newImage) {
            formData.append('image', newImage);
        }

 
        onSave({ id: incidentData.id, formData: formData });


    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Incidente #{incidentData?.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Título</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Subir Nueva Imagen (opcional)</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewImage(e.target.files[0])}
                        />
                        {currentImageDisplay && (
                            <div className="mt-2">
                                <small className="text-muted d-block mb-1">Imagen actual:</small>
                                <img src={currentImageDisplay} alt="Current Incident" style={{ maxWidth: '100px', height: 'auto' }} className="thumbnail" />
                            </div>
                        )}
                        <Form.Text className="text-muted">
                            Dejar vacío para mantener la imagen actual.
                        </Form.Text>
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default IncidentEditModal;