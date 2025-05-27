import React, { useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

// Cambiado: Ahora acepta 'buildingTitle' como prop
function BudgetUploadForm({ buildingId, buildingTitle, onUploadSuccess }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            setError('Por favor, selecciona un archivo Excel (.xlsx o .xls).');
            return;
        }

        if (!buildingId) {
            setError('Error: El ID del edificio no está disponible para asociar el presupuesto.');
            return;
        }

        setIsLoading(true);
        setMessage('');
        setError('');

        const token = getAuthToken();

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('buildingId', buildingId.toString());

        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await axios.post(`http://localhost:8080/api/budget/upload-excel`, formData, { headers });

            setMessage(response.data);
            setSelectedFile(null);

            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }

        } catch (err) {
            console.error('Error al subir el presupuesto:', err);
            if (err.response && err.response.data) {
                setError(`Fallo al subir el presupuesto: ${err.response.data}`);
            } else if (err.message) {
                setError(`Fallo al subir el presupuesto: ${err.message}`);
            } else {
                setError('Error desconocido al subir el presupuesto.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-sm">
            <Card.Body>
                {/* Cambiado: Usar buildingTitle en lugar de buildingId */}
                <Card.Title className="mb-3 text-center">Subir Presupuesto para: {buildingTitle || `Edificio ID: ${buildingId}`}</Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="excelFile" className="mb-3">
                        <Form.Label>Seleccionar archivo Excel:</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                        />
                    </Form.Group>

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isLoading || !selectedFile}
                        className="w-100"
                    >
                        {isLoading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Subiendo...
                            </>
                        ) : (
                            'Subir Presupuesto'
                        )}
                    </Button>
                </Form>

                {message && <Alert variant="success" className="mt-3">{message}</Alert>}
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

                <p className="text-muted mt-4 text-center">
                    Asegúrate de que tu archivo Excel (`.xlsx` o `.xls`) tenga la estructura esperada por el backend.
                </p>
            </Card.Body>
        </Card>
    );
}

export default BudgetUploadForm;