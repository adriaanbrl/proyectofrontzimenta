import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminView = () => {
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showConstructionForm, setShowConstructionForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Formulario para crear cliente
    const customerFormik = useFormik({
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

                const response = await axios.post('http://localhost:8080/auth/customers', customerData, {
                    headers: {
                        'Content-Type': 'application/json', // Aseguramos enviar JSON
                    },
                });
                console.log(response);
                if (response.status === 201) {
                    setSuccessMessage('Cliente creado con éxito');
                    customerFormik.resetForm();
                    setShowCustomerForm(false);
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

    // Formulario para crear construcción
    const constructionFormik = useFormik({
        initialValues: {
            address: '',
            endDate: '', // Cambiado de estimated_end_date a endDate
        },
        validationSchema: Yup.object({
            address: Yup.string().required('La dirección es requerida'),
            endDate: Yup.date().required('La fecha de fin estimada es requerida'), // Cambiado a endDate
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setSuccessMessage('');
            setErrorMessage('');

            try {
                const constructionData = {
                    address: values.address,
                    endDate: values.endDate, // Cambiado a endDate
                };
                const response = await axios.post('http://localhost:8080/api/buildings', constructionData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log(response);
                if (response.status === 201) {
                    setSuccessMessage('Construcción creada con éxito');
                    constructionFormik.resetForm();
                    setShowConstructionForm(false);
                } else {
                    setErrorMessage('Error al crear la construcción. Por favor, inténtalo de nuevo.');
                }
            } catch (error) {
                console.error('Error al crear la construcción:', error);
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
                        <Button
                            variant="link"
                            onClick={() => {
                                setShowCustomerForm(!showCustomerForm);
                                setShowConstructionForm(false);
                            }}
                            style={{ padding: 0, margin: 0 }}
                        >
                            Crear Cliente
                        </Button>
                        <span style={{ margin: '0 10px' }}>|</span>
                        <Button
                            variant="link"
                            onClick={() => {
                                setShowConstructionForm(!showConstructionForm);
                                setShowCustomerForm(false);
                            }}
                            style={{ padding: 0, margin: 0 }}
                        >
                            Crear Construcción
                        </Button>
                    </Card.Title>

                    {showCustomerForm && (
                        <Form onSubmit={customerFormik.handleSubmit} className="mt-4">
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId="email">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            onChange={customerFormik.handleChange}
                                            onBlur={customerFormik.handleBlur}
                                            value={customerFormik.values.email}
                                            isInvalid={customerFormik.touched.email && customerFormik.errors.email}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {customerFormik.errors.email}
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
                                            onChange={customerFormik.handleChange}
                                            onBlur={customerFormik.handleBlur}
                                            value={customerFormik.values.name}
                                            isInvalid={customerFormik.touched.name && customerFormik.errors.name}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {customerFormik.errors.name}
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
                                            onChange={customerFormik.handleChange}
                                            onBlur={customerFormik.handleBlur}
                                            value={customerFormik.values.surname}
                                            isInvalid={customerFormik.touched.surname && customerFormik.errors.surname}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {customerFormik.errors.surname}
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
                                            onChange={customerFormik.handleChange}
                                            onBlur={customerFormik.handleBlur}
                                            value={customerFormik.values.username}
                                            isInvalid={customerFormik.touched.username && customerFormik.errors.username}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {customerFormik.errors.username}
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
                                            onChange={customerFormik.handleChange}
                                            onBlur={customerFormik.handleBlur}
                                            value={customerFormik.values.password}
                                            isInvalid={customerFormik.touched.password && customerFormik.errors.password}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {customerFormik.errors.password}
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
                                            onChange={customerFormik.handleChange}
                                            onBlur={customerFormik.handleBlur}
                                            value={customerFormik.values.building_id}
                                            isInvalid={customerFormik.touched.building_id && customerFormik.errors.building_id}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {customerFormik.errors.building_id}
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
                                            onChange={customerFormik.handleChange}
                                            onBlur={customerFormik.handleBlur}
                                            value={customerFormik.values.rol_id}
                                            isInvalid={customerFormik.touched.rol_id && customerFormik.errors.rol_id}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {customerFormik.errors.rol_id}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear Cliente'}
                            </Button>
                        </Form>
                    )}

                    {showConstructionForm && (
                        <Form onSubmit={constructionFormik.handleSubmit} className="mt-4">
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId="address">
                                        <Form.Label>Dirección</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address"
                                            onChange={constructionFormik.handleChange}
                                            onBlur={constructionFormik.handleBlur}
                                            value={constructionFormik.values.address}
                                            isInvalid={constructionFormik.touched.address && constructionFormik.errors.address}
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {constructionFormik.errors.address}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col>
                                    <Form.Group controlId="endDate"> {/* Cambiado a endDate */}
                                        <Form.Label>Fecha de Fin Estimada</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="endDate" 
                                            onChange={constructionFormik.handleChange}
                                            onBlur={constructionFormik.handleBlur}
                                            value={constructionFormik.values.endDate} 
                                            isInvalid={constructionFormik.touched.endDate && constructionFormik.errors.endDate} 
                                            disabled={loading}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {constructionFormik.errors.endDate} {/* Cambiado a endDate */}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear Construcción'}
                            </Button>
                        </Form>
                    )}

                    {successMessage && <p className="text-success mt-3">{successMessage}</p>}
                    {errorMessage && <p className="text-danger mt-3">{errorMessage}</p>}
                    <div className="mt-4">
                        <Link to="/login">
                            <Button variant="secondary">
                                Volver a Inicio de Sesión
                            </Button>
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminView;