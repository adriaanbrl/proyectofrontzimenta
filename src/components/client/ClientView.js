import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, ProgressBar, ListGroup, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { GeoAltFill, CalendarFill, ChevronLeft, ChevronRight } from 'react-bootstrap-icons'; // Changed import
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
// import "./EventCalendar.css"; // You might need to adjust the path or copy the CSS

const ClientView = () => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buildingIdFromToken, setBuildingIdFromToken] = useState('');
  const [clientNameFromToken, setClientNameFromToken] = useState('');
  const [buildingAddressFromToken, setBuildingAddressFromToken] = useState('');
  const [buildingStartDateFromToken, setBuildingStartDateFromToken] = useState('');
  const [buildingEndDateFromToken, setBuildingEndDateFromToken] = useState('');
  const [events, setEvents] = useState([]); // State for events
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState(null);
  const [eventMonth, setEventMonth] = useState(new Date()); // State for controlling displayed month
  const timelineRef = useRef(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventoModal, setEventoModal] = useState(null);

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

  // Function to fetch events
  const fetchEvents = async (buildingId, year, month) => {
    setEventLoading(true);
    setEventError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación.');
      }

      const response = await axios.get(
          `http://localhost:8080/auth/building/${buildingId}/events?year=${year}&month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (response.data) {
        // Convert date strings to Date objects
        const eventsWithDates = response.data.map(event => ({
          ...event,
          fecha: new Date(event.date)
        }));
        setEvents(eventsWithDates);
      } else {
        setEventError(new Error('No se encontraron eventos.'));
        setEvents([]); // Ensure events is empty to avoid mapping errors
      }
    } catch (err) {
      setEventError(err);
      setEvents([]);
    } finally {
      setEventLoading(false);
    }
  };

  // Fetch project data and events
  useEffect(() => {
    const fetchProjectDataAndEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No se encontró el token de autenticación.');
        }

        // Decodificar el token para obtener el ID del edificio, nombre del cliente, dirección y fecha de inicio
        const decodedToken = jwtDecode(token);
        const buildingId = decodedToken.building_id;
        const clientName = decodedToken.name;
        const buildingAddress = decodedToken.building_address;
        const buildingStartDate = decodedToken.start_date;
        const buildingEndDate = decodedToken.end_date;

        setBuildingIdFromToken(buildingId);
        setClientNameFromToken(clientName);
        setBuildingAddressFromToken(buildingAddress);
        setBuildingStartDateFromToken(buildingStartDate);
        setBuildingEndDateFromToken(buildingEndDate);

        const response = await axios.get(
            `http://localhost:8080/auth/building/${buildingId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );

        if (response.data) {
          setProjectData(response.data);
        } else {
          setError(new Error('No se encontraron datos del proyecto.'));
        }

        // Fetch events for the initial month
        fetchEvents(buildingId, eventMonth.getFullYear(), eventMonth.getMonth() + 1);

      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDataAndEvents();
  }, [eventMonth]);

  // Function to handle scrolling
  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    setIsAtStart(scrollLeft === 0);
    setIsAtEnd(Math.abs(scrollWidth - clientWidth - scrollLeft) < 1);
  };

  // Function to scroll timeline
  const scrollTimeline = (direction) => {
    if (timelineRef.current) {
      const scrollAmount = 200; // Adjust scroll amount as needed
      timelineRef.current.scrollLeft += direction * scrollAmount;
    }
  };

  // Function to change month and fetch new events
  const changeMonth = (direction) => {
    setEventMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() + direction);
      return newMonth;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Fecha inválida';
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEventoModal(null);
  };

  const handleEventClick = (event) => {
    setEventoModal(event);
    setModalVisible(true);
  }

  if (loading) {
    return <div>Cargando datos del proyecto...</div>;
  }

  if (error) {
    return <div>Error al cargar los datos del proyecto: {error.message}</div>;
  }

  if (!projectData) {
    return <div>No se encontraron datos para este proyecto.</div>;
  }

  const { estimatedPrice, paidAmount, deadlines, projectPhases } = projectData;

  const paymentProgress = estimatedPrice === 0 ? 0 : (paidAmount / estimatedPrice) * 100;
  const pendingAmount = estimatedPrice - paidAmount;

  const formattedPlazos = deadlines ? deadlines.map(dateStr => ({ date: new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }).replace(/ de /g, ' ') })) : [];
  const formattedFasesProyecto = projectPhases ? projectPhases.map(phase => ({ name: phase.nombre, progress: phase.porcentajeCompletado })) : [];
  const formattedEstimatedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(estimatedPrice);
  const formattedPaidAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(paidAmount);
  const formattedPendingAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(pendingAmount);
  const formattedBuildingStartDate = formatDate(buildingStartDateFromToken);
  const formattedBuildingEndDate = formatDate(buildingEndDateFromToken);


  return (
      <Container className="mt-4">
        <Row>
          <Col md={12}>
            <h2 className="text-start mb-4">BIENVENIDO/A {clientNameFromToken || 'Cliente'}:</h2>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="fs-4 fw-bold text-start mb-3">PRECIO ESTIMADO</Card.Title>
                <Card.Text className="fs-2 fw-bold text-warning text-start">{formattedEstimatedPrice}</Card.Text>
                <div className="d-flex align-items-center mt-3">
                  <div className="position-relative" style={{ width: '120px', height: '120px' }}>
                    <svg width="120" height="120">
                      <circle cx="60" cy="60" r="50" fill="#e0e0e0" />
                      <circle cx="60" cy="60" r="50" fill="#ff8c00" stroke="#ff8c00" strokeWidth="10" strokeDasharray={`${paymentProgress * 3.14159 * 2 * 50 / 100} ${3.14159 * 2 * 50}`} transform={`rotate(-90 60 60)`} />
                    </svg>
                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                      <div className="fw-bold" style={{ fontSize: '0.8rem' }}>{formattedPendingAmount}</div>
                      <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>{formattedPaidAmount}</div>
                    </div>
                  </div>
                  <div className="ms-3">
                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Pagado</div>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>Pendiente</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="fs-5 fw-bold text-start mb-3">PLAZOS</Card.Title>
                <ListGroup variant="flush">
                  {formattedPlazos.map((item, index) => (
                      <ListGroup.Item key={index} className="d-flex align-items-center">
                        <div className="rounded-circle bg-secondary me-2" style={{ width: '8px', height: '8px' }}></div>
                        {item.date}
                      </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <h2 className="fs-4 fw-bold text-start mb-3">FASES DEL PROYECTO</h2>
            <div className="d-flex align-items-center position-relative">
              <div className="progress w-100" style={{ height: '5px', backgroundColor: '#e0e0e0' }}>
                {formattedFasesProyecto.map((phase, index) => (
                    <div
                        key={index}
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${phase.progress}%`, backgroundColor: '#ff8c00' }}
                        aria-valuenow={phase.progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    ></div>
                ))}
              </div>
              {formattedFasesProyecto.map((phase, index) => (
                  <div
                      key={index}
                      className="position-absolute text-center"
                      style={{ left: `${index * (100 / (formattedFasesProyecto.length - 1))}%`, transform: 'translateX(-50%)', bottom: '-20px' }}
                  >
                    <div className="rounded-circle bg-secondary" style={{ width: '15px', height: '15px' }}>
                      {phase.progress === 100 && <div className="text-white fw-bold" style={{ fontSize: '0.8rem', marginTop: '-2px', marginLeft: '1px' }}>✓</div>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>{phase.name}</div>
                  </div>
              ))}
            </div>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <h2 className="fs-4 fw-bold text-start mb-3">EVENTOS DEL PROYECTO</h2>
            <div className="d-flex align-items-center mb-3">
              <Button
                  variant="link"
                  onClick={() => changeMonth(-1)}
                  style={{ color: "black" }}
                  disabled={isAtStart}
                  className={isAtStart ? 'opacity-50' : ''}
              >
                <ChevronLeft />
              </Button>
              <span className="mx-3 fw-bold" style={{ color: "black" }}>
                            {eventMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </span>
              <Button
                  variant="link"
                  onClick={() => changeMonth(1)}
                  style={{ color: "black" }}
                  disabled={isAtEnd}
                  className={isAtEnd ? 'opacity-50' : ''}
              >
                <ChevronRight />
              </Button>
            </div>

            <div
                className="d-flex flex-nowrap overflow-auto"
                ref={timelineRef}
                onScroll={handleScroll}
                style={{ scrollBehavior: 'smooth' }}
            >
              {eventLoading && (
                  <div className="mx-2">
                    <Spinner animation="border" size="sm" /> Cargando eventos...
                  </div>
              )}
              {eventError && <div className="mx-2 text-danger">Error: {eventError}</div>}
              {!eventLoading && !eventError && events.length === 0 && (
                  <div className="mx-2 text-muted">No hay eventos para mostrar en este mes.</div>
              )}
              {events.map((evento) => (
                  <Card key={evento.id} className="mx-2" style={{ minWidth: '200px', cursor: 'pointer' }} onClick={() => handleEventClick(evento)}>
                    <Card.Body className="p-2">
                      <Card.Title className="small fw-bold mb-1">{evento.title}</Card.Title>
                      <Card.Text className="small text-muted">
                        Fecha: {formatDate(evento.fecha)}
                      </Card.Text>
                      <Card.Text className="small text-muted">
                        {evento.description || "Sin descripción"}
                      </Card.Text>
                    </Card.Body>
                  </Card>
              ))}
            </div>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={12}>
            <h2 className="fs-4 fw-bold text-start mb-3">INFORMACIÓN</h2>
            <Card className="shadow-sm">
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex align-items-center">
                    <GeoAltFill className="me-2 text-secondary" size={20} />
                    <div>
                      <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Dirección</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{buildingAddressFromToken || projectData.address || 'Dirección no disponible'}</div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex align-items-center">
                    <CalendarFill className="me-2 text-secondary" size={20} />
                    <div>
                      <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Fecha de inicio</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{formattedBuildingStartDate}</div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex align-items-center">
                    <CalendarFill className="me-2 text-secondary" size={20} />
                    <div>
                      <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Fecha de fin prevista</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{formattedBuildingEndDate}</div>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Modal show={modalVisible} onHide={handleCloseModal}>
          {eventoModal && (
              <>
                <Modal.Header closeButton>
                  <Modal.Title>{eventoModal.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="mb-3">
                                <span className="fw-bold" style={{ color: "orange" }}>
                                    {formatDate(eventoModal.fecha)}
                                </span>
                  </div>
                  <p>{eventoModal.description || "Sin descripción"}</p>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Cerrar
                  </Button>
                </Modal.Footer>
              </>
          )}
        </Modal>
      </Container>
  );
};

export default ClientView;

