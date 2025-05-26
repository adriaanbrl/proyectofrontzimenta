import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Col, Row } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const WorkerRoleAssignment = ({ setLoading, setSuccessMessage, setErrorMessage, formik }) => {
    const [workers, setWorkers] = useState([]);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const fetchWorkersAndRoles = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setErrorMessage("Error: Token de autenticación no encontrado.");
                return;
            }

            // Fetch Workers
            try {
                const workersResponse = await axios.get("http://localhost:8080/auth/worker/workers", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (workersResponse.status === 200) {
                    setWorkers(workersResponse.data);
                } else {
                    setErrorMessage("Error al cargar la lista de trabajadores.");
                }
            } catch (error) {
                console.error("Error fetching workers:", error);
                setErrorMessage(error.response?.data?.message || "Error al cargar la lista de trabajadores.");
            }

            // Fetch Roles
            try {
                const rolesResponse = await axios.get("http://localhost:8080/api/roles", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (rolesResponse.status === 200) {
                    setRoles(rolesResponse.data);
                } else {
                    setErrorMessage("Error al cargar la lista de roles.");
                }
            } catch (error) {
                console.error("Error fetching roles:", error);
                setErrorMessage(error.response?.data?.message || "Error al cargar la lista de roles.");
            }
        };

        fetchWorkersAndRoles();
    }, [setErrorMessage]); 

    return (
        <Card className="mt-4 p-3 shadow-sm card-custom">
            <Card.Title className="mb-3 text-custom">
                Asignar Rol a Trabajador
            </Card.Title>
            <Form onSubmit={formik.handleSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group controlId="workerId">
                            <Form.Label className="fw-bold">Seleccionar Trabajador</Form.Label>
                            <Form.Control
                                as="select"
                                name="workerId"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.workerId}
                                isInvalid={formik.touched.workerId && formik.errors.workerId}
                                disabled={setLoading}
                            >
                                <option value="">Selecciona un trabajador</option>
                                {workers.map((worker) => (
                                    <option key={worker.id} value={worker.id}>
                                        {worker.name} {worker.surname}
                                    </option>
                                ))}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.workerId}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="roleId">
                            <Form.Label className="fw-bold">Seleccionar Rol</Form.Label>
                            <Form.Control
                                as="select"
                                name="roleId"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.roleId}
                                isInvalid={formik.touched.roleId && formik.errors.roleId}
                                disabled={setLoading}
                            >
                                <option value="">Selecciona un rol</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.roleId}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <Button
                    type="submit"
                    variant="btn btn-outline-custom"
                    disabled={setLoading}
                    className="w-100"
                >
                    {setLoading ? "Asignando Rol..." : "Asignar Rol"}
                </Button>
            </Form>
        </Card>
    );
};

export default WorkerRoleAssignment;