import React, { useState } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Admin.css";
import WorkerRol from "./WorkerRol";

const AdminView = () => {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showConstructionForm, setShowConstructionForm] = useState(false);
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [showFourthForm, setShowFourthForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const customerFormik = useFormik({
    initialValues: {
      email: "",
      name: "",
      password: "",
      surname: "",
      username: "",
      building_id: "",
      rol_id: 1,
    },
    validationSchema: Yup.object({
      email: Yup.string()
          .email("Introduce un email válido")
          .required("El email es requerido"),
      name: Yup.string().required("El nombre es requerido"),
      password: Yup.string().required("La contraseña es requerida"),
      surname: Yup.string().required("El apellido es requerido"),
      username: Yup.string().required("El nombre de usuario es requerido"),
      building_id: Yup.number()
          .required("El ID del edificio es requerido")
          .integer("Debe ser un número entero"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

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

        const response = await axios.post(
            "http://localhost:8080/auth/customers",
            customerData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
        );
        if (response.status === 201) {
          setSuccessMessage("Cliente creado con éxito");
          customerFormik.resetForm();
          setShowCustomerForm(false);
        } else {
          setErrorMessage(
              "Error al crear el cliente. Por favor, inténtalo de nuevo."
          );
        }
      } catch (error) {
        console.error("Error al crear el cliente:", error);
        if (error.response) {
          setErrorMessage(
              `Error: ${error.response.data.message || "Error desconocido"}`
          );
        } else if (error.request) {
          setErrorMessage("No se pudo conectar con el servidor.");
        } else {
          setErrorMessage("Error al procesar la solicitud.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const constructionFormik = useFormik({
    initialValues: {
      address: "",
      endDate: "",
    },
    validationSchema: Yup.object({
      address: Yup.string().required("La dirección es requerida"),
      endDate: Yup.date().required("La fecha de fin estimada es requerida"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

      try {
        const constructionData = {
          address: values.address,
          endDate: values.endDate,
        };
        const response = await axios.post(
            "http://localhost:8080/api/buildings",
            constructionData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
        );
        if (response.status === 201) {
          setSuccessMessage("Construcción creada con éxito");
          constructionFormik.resetForm();
          setShowConstructionForm(false);
        } else {
          setErrorMessage(
              "Error al crear la construcción. Por favor, inténtalo de nuevo."
          );
        }
      } catch (error) {
        console.error("Error al crear la construcción:", error);
        if (error.response) {
          setErrorMessage(
              `Error: ${error.response.data.message || "Error desconocido"}`
          );
        } else if (error.request) {
          setErrorMessage("No se pudo conectar con el servidor.");
        } else {
          setErrorMessage("Error al procesar la solicitud.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const fourthFormik = useFormik({
    initialValues: {},
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      console.log("Fourth form submitted", values);
      setSuccessMessage("Acción del cuarto botón ejecutada.");
      setShowFourthForm(false);
    },
  });

  const hideAllForms = () => {
    setShowCustomerForm(false);
    setShowConstructionForm(false);
    setShowWorkerForm(false);
    setShowFourthForm(false);
  };

  return (
      <Container className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <Card
            className="card-custom"
            style={{
              maxWidth: "600px",
              width: "100%",
              padding: "30px",
              borderRadius: "15px",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
            }}
        >
          <Card.Body className="text-center">
            <Card.Title className="mb-4 text-custom">
              <h2 className="fw-bold">Panel de Administración</h2>
            </Card.Title>

            <Row className="mb-3 justify-content-center">
              <Col xs={6} className="mb-2">
                <Button
                    variant={showCustomerForm ? "btn-custom" : "btn-outline-custom"}
                    onClick={() => {
                      hideAllForms();
                      setShowCustomerForm(!showCustomerForm);
                    }}
                    className="w-100 btn-outline-custom"
                >
                  Crear Cliente
                </Button>
              </Col>
              <Col xs={6} className="mb-2">
                <Button
                    variant={showWorkerForm ? "btn-custom" : "btn-outline-custom"}
                    onClick={() => {
                      hideAllForms();
                      setShowWorkerForm(!showWorkerForm);
                    }}
                    className="w-100 btn-outline-custom"
                >
                  Crear Trabajador
                </Button>
              </Col>
              <Col xs={6} className="mb-2">
                <Button
                    variant={showConstructionForm ? "btn-custom" : "btn-outline-custom"}
                    onClick={() => {
                      hideAllForms();
                      setShowConstructionForm(!showConstructionForm);
                    }}
                    className="w-100 btn-outline-custom"
                >
                  Crear Construcción
                </Button>
              </Col>
              <Col xs={6} className="mb-2">
                <Button
                    variant={showFourthForm ? "btn-custom" : "btn-outline-custom"}
                    onClick={() => {
                      hideAllForms();
                      setShowFourthForm(!showFourthForm);
                    }}
                    className="w-100 btn-outline-custom"
                >
                  Gestión de Roles
                </Button>
              </Col>
            </Row>

            {showCustomerForm && (
                <Card className="mt-4 p-3 shadow-sm card-custom">
                  <Card.Title className="mb-3 text-custom">
                    Crear Nuevo Cliente
                  </Card.Title>
                  <Form onSubmit={customerFormik.handleSubmit}>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group controlId="email">
                          <Form.Label className="fw-bold ">Email</Form.Label>
                          <Form.Control
                              type="email"
                              name="email"
                              onChange={customerFormik.handleChange}
                              onBlur={customerFormik.handleBlur}
                              value={customerFormik.values.email}
                              isInvalid={
                                  customerFormik.touched.email &&
                                  customerFormik.errors.email
                              }
                              disabled={loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {customerFormik.errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="username">
                          <Form.Label className="fw-bold">
                            Nombre de Usuario
                          </Form.Label>
                          <Form.Control
                              type="text"
                              name="username"
                              onChange={customerFormik.handleChange}
                              onBlur={customerFormik.handleBlur}
                              value={customerFormik.values.username}
                              isInvalid={
                                  customerFormik.touched.username &&
                                  customerFormik.errors.username
                              }
                              disabled={loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {customerFormik.errors.username}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group controlId="name">
                          <Form.Label className="fw-bold ">Nombre</Form.Label>
                          <Form.Control
                              type="text"
                              name="name"
                              onChange={customerFormik.handleChange}
                              onBlur={customerFormik.handleBlur}
                              value={customerFormik.values.name}
                              isInvalid={
                                  customerFormik.touched.name &&
                                  customerFormik.errors.name
                              }
                              disabled={loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {customerFormik.errors.name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="surname">
                          <Form.Label className="fw-bold ">Apellido</Form.Label>
                          <Form.Control
                              type="text"
                              name="surname"
                              onChange={customerFormik.handleChange}
                              onBlur={customerFormik.handleBlur}
                              value={customerFormik.values.surname}
                              isInvalid={
                                  customerFormik.touched.surname &&
                                  customerFormik.errors.surname
                              }
                              disabled={loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {customerFormik.errors.surname}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group controlId="password">
                          <Form.Label className="fw-bold">Contraseña</Form.Label>
                          <Form.Control
                              type="password"
                              name="password"
                              onChange={customerFormik.handleChange}
                              onBlur={customerFormik.handleBlur}
                              value={customerFormik.values.password}
                              isInvalid={
                                  customerFormik.touched.password &&
                                  customerFormik.errors.password
                              }
                              disabled={loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {customerFormik.errors.password}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="building_id">
                          <Form.Label className="fw-bold ">
                            ID del Edificio
                          </Form.Label>
                          <Form.Control
                              type="number"
                              name="building_id"
                              onChange={customerFormik.handleChange}
                              onBlur={customerFormik.handleBlur}
                              value={customerFormik.values.building_id}
                              isInvalid={
                                  customerFormik.touched.building_id &&
                                  customerFormik.errors.building_id
                              }
                              disabled={loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {customerFormik.errors.building_id}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={12}>
                        <Button
                            type="submit"
                            variant="btn btn-outline-custom"
                            disabled={loading}
                            className="w-100 mt-5"
                        >
                          {loading ? "Creando..." : "Crear Cliente"}
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card>
            )}

            {showWorkerForm && <WorkerRol />}

            {showConstructionForm && (
                <Card className="mt-4 p-3 shadow-sm card-custom">
                  <Card.Title className="mb-3 text-custom">
                    Crear Nueva Construcción
                  </Card.Title>
                  <Form onSubmit={constructionFormik.handleSubmit}>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group controlId="address">
                          <Form.Label className="fw-bold">Dirección</Form.Label>
                          <Form.Control
                              type="text"
                              name="address"
                              onChange={constructionFormik.handleChange}
                              onBlur={constructionFormik.handleBlur}
                              value={constructionFormik.values.address}
                              isInvalid={
                                  constructionFormik.touched.address &&
                                  constructionFormik.errors.address
                              }
                              disabled={loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {constructionFormik.errors.address}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="endDate">
                          <Form.Label className="fw-bold">
                            Fecha de Fin Estimada
                          </Form.Label>
                          <Form.Control
                              type="date"
                              name="endDate"
                              onChange={constructionFormik.handleChange}
                              onBlur={constructionFormik.handleBlur}
                              value={constructionFormik.values.endDate}
                              isInvalid={
                                  constructionFormik.touched.endDate &&
                                  constructionFormik.errors.endDate
                              }
                              disabled={loading}
                          />
                          <Form.Control.Feedback type="invalid">
                            {constructionFormik.errors.endDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button
                        type="submit"
                        variant="btn btn-outline-custom"
                        disabled={loading}
                        className="w-100"
                    >
                      {loading ? "Creando..." : "Crear Construcción"}
                    </Button>
                  </Form>
                </Card>
            )}
            {showFourthForm && (
                <Card className="mt-4 p-3 shadow-sm card-custom">
                  <Card.Title className="mb-3 text-custom">
                    Formulario de Gestión de Roles
                  </Card.Title>
                  <Form onSubmit={fourthFormik.handleSubmit}>
                    <Form.Group controlId="roleName" className="mb-3">
                      <Form.Label className="fw-bold">Nombre del Rol</Form.Label>
                      <Form.Control type="text" placeholder="Ej: Administrador" />
                    </Form.Group>
                    <Button
                        type="submit"
                        variant="btn btn-outline-custom"
                        className="w-100"
                    >
                      Guardar Rol
                    </Button>
                  </Form>
                </Card>
            )}

            {successMessage && (
                <div className="alert alert-success mt-3">{successMessage}</div>
            )}
            {errorMessage && (
                <div className="alert alert-danger mt-3">{errorMessage}</div>
            )}

            <div className="mt-4">
              <Link to="/login" className={`btn  btn-outline-custom`}>
                Volver a Inicio de Sesión
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
  );
};

export default AdminView;
