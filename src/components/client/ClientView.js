import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, ProgressBar, ListGroup, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { GeoAltFill, CalendarFill } from 'react-bootstrap-icons';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
// import "./EventCalendar.css"; // Asegúrate de tener tus estilos CSS

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

  const handleEventClick = (item) => {
    setEventoModal(item);
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
  const formattedFasesProyecto = projectPhases ? projectPhases.map(phase => ({
    name: phase.nombre,
    startDate: phase.fechaInicio ? new Date(phase.fechaInicio) : null,
    endDate: phase.fechaFin ? new Date(phase.fechaFin) : null,
  })) : [];
  const formattedEstimatedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(estimatedPrice);
  const formattedPaidAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(paidAmount);
  const formattedPendingAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(pendingAmount);
  const formattedBuildingStartDate = formatDate(buildingStartDateFromToken);
  const formattedBuildingEndDate = formatDate(buildingEndDateFromToken);

  // Combinar fases y eventos y ordenarlos por fecha
  const timelineItems = [...(formattedFasesProyecto.map(fase => ({
    type: 'fase',
    date: fase.startDate,
    title: fase.name, // Usar name como título para fases
  }))), ...(events.map(evento => ({
    type: 'evento',
    date: new Date(evento.date),
    title: evento.title,
    description: evento.description
  })))].sort((a, b) => (a.date ? a.date.getTime() : Infinity) - (b.date ? b.date.getTime() : Infinity));

  const projectStart = buildingStartDateFromToken ? new Date(buildingStartDateFromToken) : null;
  const projectEnd = buildingEndDateFromToken ? new Date(buildingEndDateFromToken) : null;

  // Calcular la diferencia total en días del proyecto
  const totalDays = projectStart && projectEnd ? (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24) : 0;

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
            <h2 className="fs-4 fw-bold text-start mb-3">LÍNEA DE TIEMPO DEL PROYECTO</h2>
            <div style={{ overflowX: 'auto' }}>
              <div
                  className="position-relative"
                  style={{
                    height: '60px',
                    // Reducir ligeramente la longitud de la línea de tiempo
                    width: `${Math.max(600, totalDays * 10)}px`,
                  }}
                  ref={timelineRef}
              >
                <div
                    className="w-100 bg-secondary"
                    style={{ height: '2px', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
                ></div>
                {projectStart && projectEnd && timelineItems.map((item, index) => {
                  if (!item.date) return null;

                  const totalDuration = projectEnd.getTime() - projectStart.getTime();
                  const itemOffset = item.date.getTime() - projectStart.getTime();
                  const percentage = totalDuration > 0 ? (itemOffset / totalDuration) * 100 : 0;
                  const position = Math.max(0, Math.min(100, percentage));

                  const isFase = item.type === 'fase';
                  const color = isFase ? 'bg-warning' : 'bg-info';

                  const titleTopOffset = '-20px';
                  const shouldShowTitle = true;

                  return (
                      <div
                          key={index}
                          className="position-absolute"
                          style={{
                            left: `${position}%`,
                            transform: 'translateX(-50%)',
                            top: '50%',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleEventClick(item)}
                      >
                        <div className={`rounded-circle`} style={{ width: '10px', height: '10px', backgroundColor: '#f5922c' }} title={item.title}></div>
                        {shouldShowTitle && (
                            <div
                                style={{
                                  position: 'absolute',
                                  top: titleTopOffset,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: '0.8rem',
                                  whiteSpace: 'nowrap',
                                }}
                            >
                              {item.title}
                            </div>
                        )}
                      </div>
                  );
                })}
              </div>
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
                                     {formatDate(eventoModal.date || eventoModal.fecha)}
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