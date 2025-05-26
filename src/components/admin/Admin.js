import React, { useState } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Admin.css";
import WorkerRol from "./WorkerRol";
import WorkerAssigment from "./WorkerAssigment";
import WorkerRoleAssignment from "./WorkerRoleAssignment"; 
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminView = () => {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showConstructionForm, setShowConstructionForm] = useState(false);
  const [showWorkerForm, setShowWorkerForm] = useState(false); // This is for creating a new worker
  const [showWorkerAssigmentForm, setShowWorkerAssigmentForm] = useState(false); // This is for assigning workers to buildings
  const [showWorkerRoleAssignmentForm, setShowWorkerRoleAssignmentForm] = useState(false); // <--- NEW STATE
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Customer Formik (unchanged)
  const customerFormik = useFormik({
    initialValues: {
      email: "",
      username: "",
      name: "",
      surname: "",
      password: "",
      building_id: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Correo electrónico inválido").required("El correo electrónico es obligatorio."),
      username: Yup.string().required("El nombre de usuario es obligatorio."),
      name: Yup.string().required("El nombre es obligatorio."),
      surname: Yup.string().required("El apellido es obligatorio."),
      password: Yup.string().min(6, "La contraseña debe tener al menos 6 caracteres.").required("La contraseña es obligatoria."),
      building_id: Yup.number().nullable().min(1, "El ID del edificio debe ser un número positivo."),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setErrorMessage("Error: Token de autenticación no encontrado.");
          setLoading(false);
          return;
        }

        const response = await axios.post("http://localhost:8080/auth/register/client", values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 201) {
          setSuccessMessage("Cliente creado con éxito.");
          customerFormik.resetForm();
        } else {
          setErrorMessage("Error al crear el cliente.");
        }
      } catch (error) {
        console.error("Error creating customer:", error);
        setErrorMessage(
            error.response?.data?.message || "Error al crear el cliente."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Construction Formik (unchanged)
  const constructionFormik = useFormik({
    initialValues: {
      address: "",
      endDate: "",
    },
    validationSchema: Yup.object({
      address: Yup.string().required("La dirección es obligatoria."),
      endDate: Yup.date().required("La fecha de fin estimada es obligatoria.").nullable(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setErrorMessage("Error: Token de autenticación no encontrado.");
          setLoading(false);
          return;
        }

        const response = await axios.post("http://localhost:8080/auth/building", values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 201) {
          setSuccessMessage("Construcción creada con éxito.");
          constructionFormik.resetForm();
        } else {
          setErrorMessage("Error al crear la construcción.");
        }
      } catch (error) {
        console.error("Error creating construction:", error);
        setErrorMessage(
            error.response?.data?.message || "Error al crear la construcción."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  // Worker Assignment (to building) Formik (renamed and unchanged logic)
  const workerAssigmentFormik = useFormik({
    initialValues: {
      buildingId: "",
      workerId: "",
    },
    validationSchema: Yup.object({
      buildingId: Yup.string().required("Por favor, seleccione una construcción."),
      workerId: Yup.string().required("Por favor, seleccione un trabajador."),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setErrorMessage("Error: Token de autenticación no encontrado.");
          setLoading(false);
          return;
        }

        const buildingId = parseInt(values.buildingId, 10);
        const workerId = parseInt(values.workerId, 10);

        const params = new URLSearchParams();
        params.append('workerId', workerId);
        params.append('buildingId', buildingId);

        const response = await axios.post(
            "http://localhost:8080/api/assignments/worker-building",
            params,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Bearer ${token}`,
              },
            }
        );

        if (response.status === 200 || response.status === 201) {
          setSuccessMessage("Trabajador asignado a la construcción con éxito.");
          workerAssigmentFormik.resetForm();
        } else {
          setErrorMessage(
              `Error al asignar trabajador: ${response.statusText || "Respuesta inesperada."}`
          );
        }
      } catch (error) {
        console.error("Error al asignar trabajador:", error);
        if (error.response) {
          setErrorMessage(
              `Error: ${error.response.data.message || error.response.status || "Error desconocido del servidor"}`
          );
        } else if (error.request) {
          setErrorMessage("No se pudo conectar con el servidor. Por favor, verifica tu conexión o el estado del backend.");
        } else {
          setErrorMessage("Error al procesar la solicitud de asignación.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // Worker Creation Formik (unchanged logic)
  const workerFormik = useFormik({
    initialValues: {
      name: "",
      surname: "",
      contact: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("El nombre del trabajador es obligatorio."),
      surname: Yup.string().required("El apellido del trabajador es obligatorio."),
      contact: Yup.string().required("El contacto del trabajador es obligatorio."),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setErrorMessage("Error: Token de autenticación no encontrado.");
          setLoading(false);
          return;
        }

        const response = await axios.post("http://localhost:8080/api/workers", values, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 201 || response.status === 200) {
          setSuccessMessage("Trabajador creado con éxito.");
          workerFormik.resetForm();
        } else {
          setErrorMessage("Error al crear el trabajador.");
        }
      } catch (error) {
        console.error("Error creating worker:", error);
        if (error.response) {
          setErrorMessage(`Error: ${error.response.data.message || error.response.statusText || 'Error desconocido del servidor.'}`);
        } else if (error.request) {
          setErrorMessage("No se pudo conectar con el servidor. Por favor, verifica tu conexión o el estado del backend.");
        } else {
          setErrorMessage(`Error al procesar la solicitud: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // <--- NEW FORMIK FOR WORKER ROLE ASSIGNMENT
  const workerRoleAssignmentFormik = useFormik({
    initialValues: {
      workerId: "",
      roleId: "",
    },
    validationSchema: Yup.object({
      workerId: Yup.string().required("Por favor, seleccione un trabajador."),
      roleId: Yup.string().required("Por favor, seleccione un rol."),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setErrorMessage("Error: Token de autenticación no encontrado.");
          setLoading(false);
          return;
        }

        const workerId = parseInt(values.workerId, 10);
        const roleId = parseInt(values.roleId, 10);

        // --- NEW BACKEND ENDPOINT FOR ROLE ASSIGNMENT ---
        const response = await axios.post(
            `http://localhost:8080/api/workers/${workerId}/assign-role/${roleId}`, // Example endpoint
            {}, // No body needed for this type of assignment
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );

        if (response.status === 200) {
          setSuccessMessage("Rol asignado al trabajador con éxito.");
          workerRoleAssignmentFormik.resetForm();
        } else {
          setErrorMessage(
              `Error al asignar rol: ${response.statusText || "Respuesta inesperada."}`
          );
        }
      } catch (error) {
        console.error("Error al asignar rol:", error);
        if (error.response) {
          setErrorMessage(
              `Error: ${error.response.data.message || error.response.status || "Error desconocido del servidor"}`
          );
        } else if (error.request) {
          setErrorMessage("No se pudo conectar con el servidor. Por favor, verifica tu conexión o el estado del backend.");
        } else {
          setErrorMessage("Error al procesar la solicitud de asignación de rol.");
        }
      } finally {
        setLoading(false);
      }
    },
  });
  // NEW FORMIK FOR WORKER ROLE ASSIGNMENT --->


  const hideAllForms = () => {
    setShowCustomerForm(false);
    setShowConstructionForm(false);
    setShowWorkerForm(false);
    setShowWorkerAssigmentForm(false); // Renamed from showFourthForm
    setShowWorkerRoleAssignmentForm(false); // <--- NEW
    setSuccessMessage("");
    setErrorMessage("");
    customerFormik.resetForm();
    constructionFormik.resetForm();
    workerFormik.resetForm();
    workerAssigmentFormik.resetForm();
    workerRoleAssignmentFormik.resetForm(); // <--- NEW
  };

  return (
      <div style={{ paddingBottom: '60px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
        <Container className="d-flex justify-content-center align-items-center flex-grow-1">
          <Card
              className="card-custom"
              style={{
                maxWidth: "600px",
                width: "100%",
                padding: "30px",
                borderRadius: "15px",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
                margin: "20px 0"
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
                      variant={showWorkerAssigmentForm ? "btn-custom" : "btn-outline-custom"}
                      onClick={() => {
                        hideAllForms();
                        setShowWorkerAssigmentForm(!showWorkerAssigmentForm); // Renamed from showFourthForm
                      }}
                      className="w-100 btn-outline-custom"
                  >
                    Asignar Trabajador
                  </Button>
                </Col>
                {/* <--- NEW BUTTON */}
                <Col xs={6} className="mb-2">
                  <Button
                      variant={showWorkerRoleAssignmentForm ? "btn-custom" : "btn-outline-custom"}
                      onClick={() => {
                        hideAllForms();
                        setShowWorkerRoleAssignmentForm(!showWorkerRoleAssignmentForm);
                      }}
                      className="w-100 btn-outline-custom"
                  >
                    Asignar Rol a Trabajador
                  </Button>
                </Col>
                {/* NEW BUTTON ---> */}
              </Row>

              {successMessage && <p className="text-success">{successMessage}</p>}
              {errorMessage && <p className="text-danger">{errorMessage}</p>}

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
                                placeholder="ejemplo@correo.com"
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
                                placeholder="ej. Juanito"
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
                                placeholder="ej. Juan"
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
                                placeholder="ej. Pérez"
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
                                placeholder="mínimo 6 caracteres"
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
                                placeholder="ej. 123"
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

              {showWorkerForm && (
                  <WorkerRol
                      formik={workerFormik}
                      loading={loading}
                      setLoading={setLoading} // Pass setLoading
                      successMessage={successMessage}
                      setSuccessMessage={setSuccessMessage}
                      errorMessage={errorMessage}
                      setErrorMessage={setErrorMessage}
                  />
              )}

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
                                placeholder="ej. Calle Mayor 10, Madrid"
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
                                placeholder="YYYY-MM-DD"
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

              {showWorkerAssigmentForm && ( // Renamed from showFourthForm
                  <WorkerAssigment
                      formik={workerAssigmentFormik}
                      loading={loading}
                      successMessage={successMessage}
                      errorMessage={errorMessage}
                      setLoading={setLoading}
                      setSuccessMessage={setSuccessMessage}
                      setErrorMessage={setErrorMessage}
                  />
              )}

              {/* <--- NEW COMPONENT RENDERING */}
              {showWorkerRoleAssignmentForm && (
                  <WorkerRoleAssignment
                      formik={workerRoleAssignmentFormik}
                      loading={loading}
                      setLoading={setLoading}
                      successMessage={successMessage}
                      setSuccessMessage={setSuccessMessage}
                      errorMessage={errorMessage}
                      setErrorMessage={setErrorMessage}
                  />
              )}
              {/* NEW COMPONENT RENDERING ---> */}

              <div className="mt-4">
                <Link to="/login" className={`btn  btn-outline-custom`}>
                  Volver a Inicio de Sesión
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
  );
};

export default AdminView;