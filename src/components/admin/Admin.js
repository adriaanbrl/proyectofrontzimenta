import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const AdminView = () => {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const formik = useFormik({
        initialValues: {
            email: '',
            name: '',
            password: '',
            surname: '',
            username: '',
            building_id: '',
            rol_id: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Introduce un email válido').required('El email es requerido'),
            name: Yup.string().required('El nombre es requerido'),
            password: Yup.string().required('La contraseña es requerida'),
            surname: Yup.string().required('El apellido es requerido'),
            username: Yup.string().required('El nombre de usuario es requerido'),
            building_id: Yup.number().required('El ID del edificio es requerido').integer('Debe ser un número entero'),
            rol_id: Yup.number().required('El ID del rol es requerido').integer('Debe ser un número entero'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setSuccessMessage('');
            setErrorMessage('');

            try {
                const customerData = {
                    email: values.email,
                    name: values.name,
                    password: values.password,
                    surname: values.surname,
                    username: values.username,
                    building: {
                        id: parseInt(values.building_id, 10),
                    },
                    rol: {
                        id: parseInt(values.rol_id, 10),
                    },
                };

                const response = await axios.post('http://localhost:8080/auth/customers', customerData);
                console.log(response);
                if (response.status === 201) {
                    setSuccessMessage('Cliente creado con éxito');
                    formik.resetForm();
                    setShowForm(false);
                } else {
                    setErrorMessage('Error al crear el cliente. Por favor, inténtalo de nuevo.');
                }
            } catch (error) {
                console.error('Error al crear el cliente:', error);
                if (error.response) {
                    setErrorMessage(`Error: ${error.response.data.message || 'Error desconocido'}`);
                } else if (error.request) {
                    setErrorMessage('No se pudo conectar con el servidor.');
                } else {
                    setErrorMessage('Error al procesar la solicitud.');
                }
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card style={{ maxWidth: '600px', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Card.Body className="text-center">
                    <Card.Title className="mb-4">
                        <Button variant="link" onClick={() => setShowForm(!showForm)} style={{ padding: 0, margin: 0 }}>
                            Crear Cliente
                        </Button>
                    </Card.Title>
                    {showForm && (
                        <Form onSubmit={formik.handleSubmit} className="mt-4">
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId="email">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.email}
                                            isInvalid={formik.touched.email && formik.errors.email}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId="name">
                                        <Form.Label>Nombre</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.name}
                                            isInvalid={formik.touched.name && formik.errors.name}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.name}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId="surname">
                                        <Form.Label>Apellido</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="surname"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.surname}
                                            isInvalid={formik.touched.surname && formik.errors.surname}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.surname}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId="username">
                                        <Form.Label>Nombre de Usuario</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="username"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.username}
                                            isInvalid={formik.touched.username && formik.errors.username}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.username}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId="password">
                                        <Form.Label>Contraseña</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.password}
                                            isInvalid={formik.touched.password && formik.errors.password}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.password}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">

                                <Col>
                                    <Form.Group controlId="building_id">
                                        <Form.Label>ID del Edificio</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="building_id"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.building_id}
                                            isInvalid={formik.touched.building_id && formik.errors.building_id}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.building_id}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId="rol_id">
                                        <Form.Label>ID del Rol</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="rol_id"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.rol_id}
                                            isInvalid={formik.touched.rol_id && formik.errors.rol_id}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formik.errors.rol_id}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear Cliente'}
                            </Button>
                        </Form>
                    )}
                    {successMessage && <p className="text-success mt-3">{successMessage}</p>}
                    {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminView;
