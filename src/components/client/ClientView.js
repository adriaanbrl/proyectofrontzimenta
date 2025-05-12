import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, ListGroup } from 'react-bootstrap';
import { GeoAltFill, CalendarFill } from 'react-bootstrap-icons';
import axios from 'axios'; // Import axios
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode if you need to get buildingId from the token

function ClientView() {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buildingIdFromToken, setBuildingIdFromToken] = useState('');

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found.');
        }

        // Decode the token to get the building ID (assuming it's there)
        const decodedToken = jwtDecode(token);
        const buildingId = decodedToken.building_id;
        setBuildingIdFromToken(buildingId);

        // Replace with your actual API endpoint to fetch project data by building ID
        const response = await axios.get(
          `http://localhost:8080/auth/building/${buildingId}`, // Adjust the endpoint
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          setProjectData(response.data);
        } else {
          setError(new Error('Project data not found.'));
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, []); // Fetch data once on component mount

  if (loading) {
    return <div>Cargando datos del proyecto...</div>;
  }

  if (error) {
    return <div>Error al cargar los datos del proyecto: {error.message}</div>;
  }

  if (!projectData) {
    return <div>No se encontraron datos para este proyecto.</div>;
  }

  const { estimatedPrice, paidAmount, deadlines, projectPhases, address, startDate, nombreCliente } = projectData;

  const paymentProgress = estimatedPrice === 0 ? 0 : (paidAmount / estimatedPrice) * 100;
  const pendingAmount = estimatedPrice - paidAmount;

  const formattedPlazos = deadlines ? deadlines.map(dateStr => ({ date: new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }).replace(/ de /g, ' ') })) : [];
  const formattedFasesProyecto = projectPhases ? projectPhases.map(phase => ({ name: phase.nombre, progress: phase.porcentajeCompletado })) : [];
  const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : '';
  const formattedEstimatedPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(estimatedPrice);
  const formattedPaidAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(paidAmount);
  const formattedPendingAmount = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(pendingAmount);

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <h2 className="text-start mb-4">BIENVENIDO {nombreCliente || 'Cliente'}:</h2>
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
          <h2 className="fs-4 fw-bold text-start mb-3">INFORMACIÓN</h2>
          <Card className="shadow-sm">
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex align-items-center">
                  <GeoAltFill className="me-2 text-secondary" size={20} />
                  <div>
                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Address</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{address}</div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex align-items-center">
                  <CalendarFill className="me-2 text-secondary" size={20} />
                  <div>
                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Start date</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{formattedStartDate}</div>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ClientView;