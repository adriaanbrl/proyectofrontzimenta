import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Alert, Spinner } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./EventCalendar.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const EventCalendar = () => {
  const navigate = useNavigate();
  const [buildingId, setBuildingId] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mesActual, setMesActual] = useState(new Date());
  const [eventosProximos, setEventosProximos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const primerDiaDelMes = new Date(
      mesActual.getFullYear(),
      mesActual.getMonth(),
      1
  );
  const ultimoDiaDelMes = new Date(
      mesActual.getFullYear(),
      mesActual.getMonth() + 1,
      0
  );
  const numeroDeDias = ultimoDiaDelMes.getDate();
  const primerDiaSemana = primerDiaDelMes.getDay();

  const diasDelMes = [];
  const espaciosNecesarios = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
  for (let i = 0; i < espaciosNecesarios; i++) {
    diasDelMes.push("");
  }
  for (let i = 1; i <= numeroDeDias; i++) {
    diasDelMes.push(i);
  }

  const cambiarMes = (direccion) => {
    const nuevoMes = new Date(mesActual);
    nuevoMes.setMonth(mesActual.getMonth() + direccion);
    setMesActual(nuevoMes);
  };

  const seleccionarFecha = (dia) => {
    if (dia) {
      setFechaSeleccionada(
          new Date(mesActual.getFullYear(), mesActual.getMonth(), dia)
      );
    }
  };

  const formatearFecha = (fecha) => {
    const diaSemana = new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
    }).format(fecha);
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    return `${diaSemana}, ${mes} ${dia}`;
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    document.title = "Calendario de Eventos";
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setBuildingId(decodedToken.building_id || "");
        console.log(
            "building_id recibido del customer (JWT):",
            decodedToken.building_id
        );

        if (decodedToken.building_id) {
          fetchBuildingEvents(
              decodedToken.building_id,
              mesActual.getFullYear(),
              mesActual.getMonth() + 1
          );
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        setError("Error al autenticar al usuario.");
      }
    } else {
      setError("No se encontró el token de autenticación.");
    }
  }, [mesActual]);

  const fetchBuildingEvents = async (id, year, month) => {
    setLoading(true);
    setError(null);
    setEventosProximos([]);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
          `http://localhost:8080/auth/building/${id}/events?year=${year}&month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (!response.ok) {
        throw new Error(
            `Error al obtener los eventos del edificio: ${response.status}`
        );
      }

      const data = await response.json();
      setEventosProximos(
          data.map((evento) => ({
            ...evento,
            fecha: new Date(evento.date),
          }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <Container className="calendario-eventos p-3">
          <p>
            <Spinner animation="border" size="sm" /> Cargando eventos...
          </p>
        </Container>
    );
  }

  if (error) {
    return (
        <Container className="calendario-eventos p-3">
          <Alert variant="danger">{error}</Alert>
          <Button variant="link" onClick={handleGoBack}>
            <FaChevronLeft /> Volver
          </Button>
        </Container>
    );
  }

  return (
      <Container className="calendario-eventos p-3">
        <div className="d-flex align-items-center mb-3">
          <Button
              variant="link"
              onClick={handleGoBack}
              className="back-button"
              aria-label="Volver atrás"
              style={{ padding: 0, marginRight: "10px" }}
          >
            <FaChevronLeft size={20} color="orange" />
          </Button>
          <h1 className="calendario-eventos-title" style={{ margin: 0 }}>
            Calendario de Eventos
          </h1>
        </div>

        <Row className="mb-3 align-items-center justify-content-between">
          <Col xs="auto">
            <Button variant="link" onClick={() => cambiarMes(-1)}>
              <FaChevronLeft />
            </Button>
          </Col>
          <Col xs="auto" className="fw-bold text-center">
            {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
          </Col>
          <Col xs="auto">
            <Button variant="link" onClick={() => cambiarMes(1)}>
              <FaChevronRight />
            </Button>
          </Col>
        </Row>

        <Row className="mb-2">
          {diasSemana.map((dia, index) => (
              <Col key={index} className="text-center small fw-bold">
                {dia}
              </Col>
          ))}
        </Row>

        <Row className="gx-0">
          {diasDelMes.map((dia, index) => (
              <Col key={index} xs="auto" className="p-1">
                {dia ? (
                    <Button
                        variant={
                          fechaSeleccionada.getDate() === dia &&
                          fechaSeleccionada.getMonth() === mesActual.getMonth() &&
                          fechaSeleccionada.getFullYear() === mesActual.getFullYear()
                              ? "primary"
                              : "light"
                        }
                        className={`rounded-circle w-100 h-100 d-flex align-items-center justify-content-center ${
                            new Date(
                                mesActual.getFullYear(),
                                mesActual.getMonth(),
                                dia
                            ).toDateString() === new Date().toDateString()
                                ? "fw-bold"
                                : ""
                        }`}
                        onClick={() => seleccionarFecha(dia)}
                    >
                      {dia}
                    </Button>
                ) : (
                    <div className="w-100 h-100"></div>
                )}
              </Col>
          ))}
        </Row>

        <hr className="my-4" />

        <div className="proximos-eventos" style={{ marginBottom: '60px' }}>
          <h2 className="h6 mb-3">EVENTOS PRÓXIMOS</h2>
          {eventosProximos.map((evento, index) => (
              <Card key={index} className="mb-2 evento-card">
                <Card.Body className="p-2 d-flex align-items-center">
                  <div className="fecha-evento me-3">
                    <p className="dia-semana fw-bold mb-0" style={{ color: 'orange' }}>
                      {new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(new Date(evento.fecha)).toUpperCase()}
                    </p>
                    <p className="dia-mes mb-0" style={{ color: 'orange', fontSize: '1.2em' }}>
                      {new Date(evento.fecha).getDate()}
                    </p>
                    <p className="mes small text-muted mb-0"> {/* Añadimos mb-0 para alineación */}
                      {meses[new Date(evento.fecha).getMonth()].substring(0, 3).toUpperCase()}
                    </p>
                    <p className="year small text-muted mb-0"> {/* Añadimos el año */}
                      {new Date(evento.fecha).getFullYear()}
                    </p>
                  </div>
                  <div>
                    <Card.Title className="small fw-bold mb-1">{evento.title}</Card.Title>
                    <Card.Text className="small text-muted">{evento.description || 'Sin descripción'}</Card.Text>
                  </div>
                </Card.Body>
              </Card>
          ))}
          {eventosProximos.length === 0 && !loading && (
              <p className="small text-muted">
                No hay eventos programados para este edificio en este mes.
              </p>
          )}
        </div>
      </Container>
  );
};

export default EventCalendar;