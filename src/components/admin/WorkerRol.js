import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function WorkerRol() {
    const [showCreateWorkerForm, setShowCreateWorkerForm] = useState(false);
    const [showAssignWorkerForm, setShowAssignWorkerForm] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [loadingWorkers, setLoadingWorkers] = useState(false);
    const [loadingBuildings, setLoadingBuildings] = useState(false);


    // Fetch workers from the backend
    useEffect(() => {
        const fetchWorkers = async () => {
            setLoadingWorkers(true);
            try {
                const response = await axios.get("http://localhost:8080/api/trabajador/listar"); // Adjust the URL
                setWorkers(response.data);
            } catch (error) {
                console.error("Error fetching workers:", error);
                alert("Failed to load workers. Please check the console and your backend server.");
            } finally {
                setLoadingWorkers(false);
            }
        };

        if (showAssignWorkerForm) { // Only fetch if the form is shown
            fetchWorkers();
        }
    }, [showAssignWorkerForm]); // Dependency on showAssignWorkerForm

    // Fetch buildings from the backend
    useEffect(() => {
        const fetchBuildings = async () => {
            setLoadingBuildings(true);
            try {
                const response = await axios.get("http://localhost:8080/api/obra/listar"); // Adjust the URL
                setBuildings(response.data);
            } catch (error) {
                console.error("Error fetching buildings:", error);
                alert("Failed to load buildings. Please check the console and your backend server.");
            } finally {
                setLoadingBuildings(false);
            }
        };

        if (showAssignWorkerForm) { // Only fetch if the form is shown
            fetchBuildings();
        }
    }, [showAssignWorkerForm]); // Dependency on showAssignWorkerForm

    const handleCreateWorkerClick = () => {
        setShowCreateWorkerForm(true);
        setShowAssignWorkerForm(false); // Ensure only one form is shown
    };

    const handleAssignWorkerClick = () => {
        setShowAssignWorkerForm(true);
        setShowCreateWorkerForm(false); // Ensure only one form is shown
    };

    const handleSubmitCreateWorker = async (event: React.FormEvent) => {
        event.preventDefault();
        const formData = {
            telefono: event.currentTarget.telefono.value,
            nombre: event.currentTarget.nombre.value,
            apellidos: event.currentTarget.apellidos.value,
        };

        try {
            const response = await axios.post("http://localhost:8080/api/trabajador/crear", formData); // Adjust URL
            console.log("Worker created:", response.data);
            setShowCreateWorkerForm(false); // Hide the form after successful submission
            alert("Worker created successfully!");
            // Optionally, refresh the worker list if needed
        } catch (error) {
            console.error("Error creating worker:", error);
            alert("Failed to create worker. Please check the console and your backend server.");
        }
    };

    const handleSubmitAssignWorker = async () => {
        if (!selectedWorkerId || !selectedBuildingId) {
            alert("Please select both a worker and a building.");
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8080/api/trabajador/asignar/${selectedWorkerId}/${selectedBuildingId}` // Adjust the URL
            );
            console.log("Worker assigned:", response.data);
            alert("Worker assigned successfully!");
            setShowAssignWorkerForm(false); // Hide form
            setSelectedWorkerId(undefined); // Reset
            setSelectedBuildingId(undefined); // Reset

        } catch (error) {
            console.error("Error assigning worker:", error);
            alert("Failed to assign worker. Please check the console and your backend server.");
        }
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="mt-5">
                        <Card.Body>
                            <h1 className="mb-4">Gestión de Workers</h1>

                            {/* Buttons for actions */}
                            <Row className="mb-4">
                                <Col>
                                    <Button
                                        variant="outline-warning"
                                        className="w-100 py-3"
                                        onClick={handleCreateWorkerClick}
                                        style={{ borderColor: '#ffc107', color: '#ffc107', borderRadius: '0.5rem' }}
                                    >
                                        Crear Worker
                                    </Button>
                                </Col>
                                <Col>
                                    <Button
                                        variant="outline-warning"
                                        className="w-100 py-3"
                                        onClick={handleAssignWorkerClick}
                                        style={{ borderColor: '#ffc107', color: '#ffc107', borderRadius: '0.5rem' }}
                                    >
                                        Asignar Worker a Edificio
                                    </Button>
                                </Col>
                            </Row>

                            {/* Create Worker Form */}
                            {showCreateWorkerForm && (
                                <Card className="mt-4">
                                    <Card.Body>
                                        <Card.Title className="mb-3">Crear Nuevo Worker</Card.Title>
                                        <Form onSubmit={handleSubmitCreateWorker}>
                                            <Form.Group className="mb-3" controlId="telefono">
                                                <Form.Label>Teléfono</Form.Label>
                                                <Form.Control type="text" placeholder="Ingrese el teléfono" required />
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="nombre">
                                                <Form.Label>Nombre</Form.Label>
                                                <Form.Control type="text" placeholder="Ingrese el nombre" required />
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="apellidos">
                                                <Form.Label>Apellidos</Form.Label>
                                                <Form.Control type="text" placeholder="Ingrese los apellidos" required />
                                            </Form.Group>

                                            <Button variant="primary" type="submit">
                                                Guardar Worker
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                className="ms-2"
                                                onClick={() => setShowCreateWorkerForm(false)}
                                            >
                                                Cancelar
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Assign Worker Form */}
                            {showAssignWorkerForm && (
                                <Card className="mt-4">
                                    <Card.Body>
                                        <Card.Title className="mb-3">Asignar Worker a Edificio</Card.Title>
                                        {loadingWorkers ? (
                                            <p>Loading workers...</p>
                                        ) : (
                                            <div className="mb-3">
                                                <Form.Label>Trabajador</Form.Label>
                                                <Select onValueChange={setSelectedWorkerId} value={selectedWorkerId}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Seleccione un trabajador" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {workers.map((worker) => (
                                                            <SelectItem key={worker.id} value={worker.id.toString()}>
                                                                {worker.nombre} {worker.apellidos}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {loadingBuildings ? (
                                            <p>Loading buildings...</p>
                                        ) : (
                                            <div className="mb-3">
                                                <Form.Label>Edificio</Form.Label>
                                                <Select onValueChange={setSelectedBuildingId} value={selectedBuildingId}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Seleccione un edificio" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {buildings.map((building) => (
                                                            <SelectItem key={building.id} value={building.id.toString()}>
                                                                {building.address}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <Button
                                            variant="primary"
                                            onClick={handleSubmitAssignWorker}
                                            disabled={!selectedWorkerId || !selectedBuildingId}
                                        >
                                            Asignar
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="ms-2"
                                            onClick={() => setShowAssignWorkerForm(false)}
                                        >
                                            Cancelar
                                        </Button>
                                    </Card.Body>
                                </Card>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default WorkerRol;
