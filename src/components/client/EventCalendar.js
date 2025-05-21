import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Card, Alert, Spinner, Modal } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./EventCalendar.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ChevronLeft } from 'lucide-react'; // Import ChevronLeft from lucide-react

const EventCalendar = () => {
  const navigate = useNavigate();
  const [buildingId, setBuildingId] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mesActual, setMesActual] = useState(new Date());
  const [eventosProximos, setEventosProximos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diasConEventos, setDiasConEventos] = useState(new Set());
  const [diasPasadosConEventos, setDiasPasadosConEventos] = useState(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [eventoModal, setEventoModal] = useState(null);

  const diasSemana = ["L", "M", "X", "J", "V", "S", "D"];
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const primerDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
  const ultimoDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
  const numeroDeDias = ultimoDiaDelMes.getDate();
  const primerDiaSemana = primerDiaDelMes.getDay(); // 0 for Sunday, 1 for Monday

  const diasDelMes = [];
  // Adjust starting day for Monday being the first day of the week
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
    // When changing month, clear selected date to avoid highlighting a day not in new month
    setFechaSeleccionada(new Date());
  };

  const seleccionarFecha = (dia) => {
    if (dia) {
      const fechaSeleccionadaCalendario = new Date(
          mesActual.getFullYear(),
          mesActual.getMonth(),
          dia
      );
      setFechaSeleccionada(fechaSeleccionadaCalendario);

      const eventosParaFecha = eventosProximos.filter(
          (evento) =>
              evento.fecha.toDateString() === fechaSeleccionadaCalendario.toDateString()
      );

      // If there are multiple events for the day, you might want a list in the modal
      // For now, let's just pick the first one or show a general message
      if (eventosParaFecha.length > 0) {
        setEventoModal(eventosParaFecha[0]); // Show details of the first event
        setModalVisible(true);
      } else {
        // No event for this specific day, close modal if open
        setModalVisible(false);
        setEventoModal(null);
      }
    }
  };

  const navegarAlMesEvento = (evento) => {
    // Set the calendar to the month of the clicked event
    setMesActual(new Date(evento.fecha));
    // Select the day of the clicked event
    setFechaSeleccionada(new Date(evento.fecha));
    // Potentially open modal for this event
    setEventoModal(evento);
    setModalVisible(true);
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

  const handleCloseModal = () => {
    setModalVisible(false);
    setEventoModal(null);
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
    setDiasConEventos(new Set());
    setDiasPasadosConEventos(new Set());

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
      const eventosConFecha = data.map((evento) => ({
        ...evento,
        fecha: new Date(evento.date),
      }));

      const ahora = new Date();
      // Set to start of today for comparison (ignore time)
      const hoySinHora = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

      const eventosFuturos = eventosConFecha.filter(
          (evento) => new Date(evento.fecha.getFullYear(), evento.fecha.getMonth(), evento.fecha.getDate()) >= hoySinHora
      );
      const eventosPasadosEnMesActual = eventosConFecha.filter(
          (evento) =>
              evento.fecha.getFullYear() === mesActual.getFullYear() &&
              evento.fecha.getMonth() === mesActual.getMonth() &&
              new Date(evento.fecha.getFullYear(), evento.fecha.getMonth(), evento.fecha.getDate()) < hoySinHora
      );

      eventosFuturos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
      setEventosProximos(eventosFuturos);

      const diasConEventosEnMesActual = new Set();
      eventosFuturos.forEach((evento) => {
        if (
            evento.fecha.getFullYear() === mesActual.getFullYear() &&
            evento.fecha.getMonth() === mesActual.getMonth()
        ) {
          diasConEventosEnMesActual.add(evento.fecha.getDate());
        }
      });
      setDiasConEventos(diasConEventosEnMesActual);

      const diasPasados = new Set();
      eventosPasadosEnMesActual.forEach((evento) => {
        diasPasados.add(evento.fecha.getDate());
      });
      setDiasPasadosConEventos(diasPasados);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if a day is today
  const isToday = (day) => {
    const today = new Date();
    return (
        day === today.getDate() &&
        mesActual.getMonth() === today.getMonth() &&
        mesActual.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return (
        <Container className="calendario-eventos p-3 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando eventos...</p>
        </Container>
    );
  }

  if (error) {
    return (
        <Container className="calendario-eventos p-3 text-center">
          <Alert variant="danger">{error}</Alert>
          <Button variant="outline-secondary" onClick={handleGoBack}>
            Volver
          </Button>
        </Container>
    );
  }

  return (
      <Container className="calendario-eventos p-3 p-md-5"> {/* Added p-md-5 for more padding on larger screens */}
        <div className="header-section d-flex align-items-center justify-content-center mb-4">
          <Button
              variant="link"
              onClick={handleGoBack}
              className="back-button me-3"
              aria-label="Volver atrás"
              style={{ padding: 0 }}
          >
            <ChevronLeft size={24} color="orange" /> {/* Increased size */}
          </Button>
          <h1 className="calendario-eventos-title text-center flex-grow-1">
            Calendario de Eventos
          </h1>
          <div style={{ width: "24px" }}></div> {/* Placeholder for alignment */}
        </div>

        {/* Month Navigation */}
        <Row className="month-navigation mb-4 align-items-center justify-content-between">
          <Col xs="auto">
            <Button
                variant="link"
                onClick={() => cambiarMes(-1)}
                className="nav-button"
                aria-label="Mes anterior"
            >
              <FaChevronLeft size={20} />
            </Button>
          </Col>
          <Col className="text-center">
            <h2 className="current-month-year mb-0">
              {meses[mesActual.getMonth()]} {mesActual.getFullYear()}
            </h2>
          </Col>
          <Col xs="auto">
            <Button
                variant="link"
                onClick={() => cambiarMes(1)}
                className="nav-button"
                aria-label="Mes siguiente"
            >
              <FaChevronRight size={20} />
            </Button>
          </Col>
        </Row>

        {/* Days of Week Headers */}
        <Row className="days-of-week mb-2 text-center">
          {diasSemana.map((dia, index) => (
              <Col key={index} className="day-header fw-bold">
                {dia}
              </Col>
          ))}
        </Row>

        {/* Calendar Grid */}
        <Row className="calendar-grid gx-1 gy-1"> {/* Increased gutter for better spacing */}
          {diasDelMes.map((dia, index) => (
              <Col key={index} xs={12 / 7} className="day-cell p-0"> {/* Use xs={12/7} for even column distribution */}
                {dia ? (
                    <Button
                        variant="light" // Default variant, will be overridden by custom classes
                        className={`day-button d-flex flex-column align-items-center justify-content-center text-center w-100 h-100 ${
                            isToday(dia) ? "day-today" : ""
                        } ${
                            diasConEventos.has(dia) ? "day-has-event" : ""
                        } ${
                            diasPasadosConEventos.has(dia) ? "day-past-event" : ""
                        } ${
                            fechaSeleccionada.getDate() === dia &&
                            fechaSeleccionada.getMonth() === mesActual.getMonth() &&
                            fechaSeleccionada.getFullYear() === mesActual.getFullYear()
                                ? "day-selected"
                                : ""
                        }`}
                        onClick={() => seleccionarFecha(dia)}
                        aria-label={`Día ${dia}`}
                    >
                      <span className="day-number">{dia}</span>
                      {diasConEventos.has(dia) && (
                          <div className="event-indicator"></div> // Small dot indicator
                      )}
                    </Button>
                ) : (
                    <div className="day-empty w-100 h-100"></div>
                )}
              </Col>
          ))}
        </Row>

        <hr className="my-5" /> 

        <div className="proximos-eventos" style={{ marginBottom: "60px" }}>
          <h2 className="h6 mb-3" style={{ color: "orange" }}>
            PRÓXIMOS EVENTOS
          </h2>
          {eventosProximos.map((evento, index) => (
              <Card
                  key={evento.id}
                  className="mb-2 evento-card"
                  onClick={() => navegarAlMesEvento(evento)}
                  style={{ cursor: "pointer" }}
              >
                <Card.Body className="p-2 d-flex align-items-center">
                  <div className="fecha-evento me-3 text-center">
                    <p
                        className="dia-semana fw-bold mb-0"
                        style={{ color: "orange" }}
                    >
                      {new Intl.DateTimeFormat("es-ES", {
                        weekday: "short",
                      }).format(new Date(evento.fecha)).toUpperCase()}
                    </p>
                    <p
                        className="dia-mes mb-0"
                        style={{ color: "orange", fontSize: "1.2em" }}
                    >
                      {new Date(evento.fecha).getDate()}
                    </p>
                    <p className="mes small text-muted mb-0">
                      {meses[new Date(evento.fecha).getMonth()]
                          .substring(0, 3)
                          .toUpperCase()}
                    </p>
                    <p className="anio small text-muted mb-0">
                      {new Date(evento.fecha).getFullYear()}
                    </p>
                  </div>
                  {/* MODIFIED CONTENT DIV CLASSES */}
                  <div className="flex-grow-1 text-center"> {/* Added flex-grow-1 to take remaining space, and text-center to center title/description */}
                    <Card.Title className="small fw-bold mb-1">
                      {evento.title}
                    </Card.Title>
                    <Card.Text className="small text-muted">
                      {evento.description || "Sin descripción"}
                    </Card.Text>
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

        <Modal show={modalVisible} onHide={handleCloseModal} centered> {/* Added centered for better modal positioning */}
          {eventoModal && (
              <>
                <Modal.Header closeButton className="border-0 pb-0">
                  <Modal.Title className="fw-bold">{eventoModal.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
                  <p className="text-muted mb-3">
                    {new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(eventoModal.fecha))}
                  </p>
                  <p>{eventoModal.description || "Sin descripción"}</p>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                  <Button variant="outline-secondary" onClick={handleCloseModal}>
                    Cerrar
                  </Button>
                </Modal.Footer>
              </>
          )}
        </Modal>
      </Container>
  );
};

export default EventCalendar;