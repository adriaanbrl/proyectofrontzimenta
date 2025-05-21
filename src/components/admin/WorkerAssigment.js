import React, { useState, useEffect } from "react";
import { Card, Form, Button } from "react-bootstrap";
import axios from "axios";

const WorkerAssigment = ({ formik, loading, successMessage, errorMessage }) => {
    const [buildings, setBuildings] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loadingBuildings, setLoadingBuildings] = useState(true);
    const [loadingWorkers, setLoadingWorkers] = useState(true);
    const [errorBuildings, setErrorBuildings] = useState(null);
    const [errorWorkers, setErrorWorkers] = useState(null);

    const fetchData = async (url, setter, errorSetter, loadingSetter) => {
        loadingSetter(true);
        errorSetter(null);
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                throw new Error("Authentication token not found.");
            }
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const responseData = response.data;
            let dataToSet = [];
            if (Array.isArray(responseData)) {
                dataToSet = responseData;
            } else if (responseData && typeof responseData === 'object') {
                dataToSet = [responseData];
            }

            console.log(`Data from ${url}:`, dataToSet);
            setter(dataToSet);

        } catch (err) {
            console.error(`Error fetching data from ${url}:`, err);
            errorSetter(err);
            setter([]);
        } finally {
            loadingSetter(false);
        }
    };

    useEffect(() => {
        fetchData(
            "http://localhost:8080/api/buildings",
            setBuildings,
            setErrorBuildings,
            setLoadingBuildings
        );

        // Fetch workers
        fetchData(
            "http://localhost:8080/api/workers", 
            setWorkers,
            setErrorWorkers,
            setLoadingWorkers
        );
    }, []);

    return (
        <Card className="mt-4 p-3 shadow-sm card-custom">
            <Card.Title className="mb-3 text-custom">
                Asignar a un trabajador una construcción
            </Card.Title>
            <Form onSubmit={formik.handleSubmit}>
                <Form.Group controlId="buildingId" className="mb-3">
                    <Form.Label className="fw-bold">Seleccionar Construcción</Form.Label>
                    <Form.Select
                        name="buildingId"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.buildingId}
                        isInvalid={formik.touched.buildingId && formik.errors.buildingId}
                        disabled={loading || loadingBuildings}
                    >
                        <option value="">{loadingBuildings ? "Cargando construcciones..." : "Seleccione una construcción"}</option>
                        {errorBuildings && <option disabled>Error al cargar construcciones</option>}
                        {buildings.map((building) => (
                            <option key={building.id} value={building.id}>
                                {building.address}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {formik.errors.buildingId}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="workerId" className="mb-3">
                    <Form.Label className="fw-bold">Seleccionar Trabajador</Form.Label>
                    <Form.Select
                        name="workerId"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.workerId}
                        isInvalid={formik.touched.workerId && formik.errors.workerId}
                        disabled={loading || loadingWorkers}
                    >
                        <option value="">{loadingWorkers ? "Cargando trabajadores..." : "Seleccione un trabajador"}</option>
                        {errorWorkers && <option disabled>Error al cargar trabajadores</option>}
                        {workers.map((worker) => (
                            <option key={worker.id} value={worker.id}>
                                {worker.name} {worker.surname}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {formik.errors.workerId}
                    </Form.Control.Feedback>
                </Form.Group>

                <Button
                    type="submit"
                    variant="btn btn-outline-custom"
                    className="w-100"
                    disabled={loading || loadingBuildings || loadingWorkers}
                >
                    {loading ? "Asignando..." : "Asignar Building"}
                </Button>
            </Form>
            {successMessage && (
                <div className="alert alert-success mt-3">{successMessage}</div>
            )}
            {errorMessage && (
                <div className="alert alert-danger mt-3">{errorMessage}</div>
            )}
        </Card>
    );
};

export default WorkerAssigment;