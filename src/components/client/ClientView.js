import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Button,
  Modal,
} from "react-bootstrap";
import {
  GeoAltFill,
  CalendarFill,
  EyeFill,
  EyeSlashFill,
} from "react-bootstrap-icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PrecioEstimado = ({ precio }) => {
  const [verPrecio, setVerPrecio] = useState(false);

  const toggleVerPrecio = () => {
    setVerPrecio(!verPrecio);
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(precio);
  };

  return (
    <div>
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}
      >
        <div
          onClick={toggleVerPrecio}
          style={{ cursor: "pointer", marginRight: "5px" }}
        >
          {verPrecio ? <EyeFill size={20} /> : <EyeSlashFill size={20} />}
        </div>
        <span style={{ fontWeight: "bold" }}>PRECIO ESTIMADO</span>
      </div>
      <div
        style={{
          fontSize: "1.5em",
          fontWeight: "bold",
          color: "#ff8c00",
          opacity: verPrecio ? 1 : 0.3,
        }}
      >
        {verPrecio ? formatearPrecio(precio) : "********"}
      </div>
    </div>
  );
};

const ClientView = () => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buildingIdFromToken, setBuildingIdFromToken] = useState("");
  const [clientNameFromToken, setClientNameFromToken] = useState("");
  const [buildingAddressFromToken, setBuildingAddressFromToken] = useState("");
  const [buildingStartDateFromToken, setBuildingStartDateFromToken] =
    useState("");
  const [buildingEndDateFromToken, setBuildingEndDateFromToken] = useState("");
  const [events, setEvents] = useState([]);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState(null);
  const [eventMonth, setEventMonth] = useState(new Date());
  const timelineRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventoModal, setEventoModal] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);

  const fetchEvents = async (buildingId, year, month) => {
    setEventLoading(true);
    setEventError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token de autenticación.");
      const response = await axios.get(
        `http://localhost:8080/auth/building/${buildingId}/events?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data) {
        const eventsWithDates = response.data.map((event) => ({
          ...event,
          fecha: new Date(event.date),
        }));
        setEvents(eventsWithDates);
      } else {
        setEventError(new Error("No se encontraron eventos."));
        setEvents([]);
      }
    } catch (err) {
      setEventError(err);
      setEvents([]);
    } finally {
      setEventLoading(false);
    }
  };

  const fetchBudget = async (buildingId) => {
    setBudgetLoading(true);
    setBudgetError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token de autenticación.");
      const response = await axios.get(
        `http://localhost:8080/api/budget/${buildingId}/budget`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data && response.data.amount !== undefined) {
        setBudgetAmount(response.data.amount);
      } else {
        setBudgetError(new Error("No se encontró el monto del presupuesto."));
        setBudgetAmount(0);
      }
    } catch (err) {
      setBudgetError(err);
      setBudgetAmount(0);
    } finally {
      setBudgetLoading(false);
    }
  };

  const fetchInvoiceAmount = async (buildingId) => {
    setInvoiceLoading(true);
    setInvoiceError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token de autenticación.");
      const response = await axios.get(
        `http://localhost:8080/api/invoices/building/${buildingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data !== undefined && response.data !== null) {
        console.log("Monto de facturas recibido:", response.data);
        setInvoiceAmount(response.data);
      } else {
        setInvoiceError(
          new Error("No se encontró el monto total de las facturas.")
        );
        setInvoiceAmount(0);
      }
    } catch (err) {
      setInvoiceError(err);
      setInvoiceAmount(0);
    } finally {
      setInvoiceLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        if (!token)
          throw new Error("No se encontró el token de autenticación.");
        const decodedToken = jwtDecode(token);
        const buildingId = decodedToken.building_id;
        setBuildingIdFromToken(buildingId);
        setClientNameFromToken(decodedToken.name);
        setBuildingAddressFromToken(decodedToken.building_address);
        setBuildingStartDateFromToken(decodedToken.start_date);
        setBuildingEndDateFromToken(decodedToken.end_date);
        const projectResponse = await axios.get(
          `http://localhost:8080/auth/building/${buildingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (projectResponse.data) {
          setProjectData(projectResponse.data);
        } else {
          setError(new Error("No se encontraron datos del proyecto."));
        }
        await fetchBudget(buildingId);
        await fetchInvoiceAmount(buildingId); // Llamada para obtener el amount de las facturas
        await fetchEvents(
          buildingId,
          new Date().getFullYear(),
          new Date().getMonth() + 1
        );
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (buildingIdFromToken) {
      fetchEvents(
        buildingIdFromToken,
        eventMonth.getFullYear(),
        eventMonth.getMonth() + 1
      );
    }
  }, [buildingIdFromToken, eventMonth]);

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha inválida";
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEventoModal(null);
  };

  const handleEventClick = (item) => {
    setEventoModal(item);
    setModalVisible(true);
  };

  if (loading || budgetLoading || invoiceLoading) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div>Error al cargar los datos del proyecto: {error.message}</div>;
  }

  if (!projectData) {
    return <div>No se encontraron datos para este proyecto.</div>;
  }

  const {
    paidAmount: projectPaidAmount,
    deadlines,
    projectPhases,
  } = projectData;
  const estimatedPrice =
    budgetAmount !== null ? budgetAmount : projectData.estimatedPrice || 0;
  const paidAmount =
    invoiceAmount !== null ? invoiceAmount : projectPaidAmount || 0; // Usar invoiceAmount si está disponible
  const paymentProgress =
    estimatedPrice === 0 ? 0 : (paidAmount / estimatedPrice) * 100;
  const pendingAmountValue = estimatedPrice - paidAmount;
  const formattedPendingAmountForGraph = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(pendingAmountValue);
  const formattedPaidAmountForGraph = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(paidAmount);
  const formattedBuildingStartDate = formatDate(buildingStartDateFromToken);
  const formattedBuildingEndDate = formatDate(buildingEndDateFromToken);

  const formattedPlazos = deadlines
    ? deadlines.map((dateStr) => ({
        date: new Date(dateStr)
          .toLocaleDateString("es-ES", { day: "numeric", month: "long" })
          .replace(/ de /g, " "),
      }))
    : [];
  const formattedFasesProyecto = projectPhases
    ? projectPhases.map((phase) => ({
        name: phase.nombre,
        startDate: phase.fechaInicio ? new Date(phase.fechaInicio) : null,
        endDate: phase.fechaFin ? new Date(phase.fechaFin) : null,
      }))
    : [];

  const timelineItems = [
    ...formattedFasesProyecto.map((fase) => ({
      type: "fase",
      date: fase.startDate,
      title: fase.name,
    })),
    ...events.map((evento) => ({
      type: "evento",
      date: new Date(evento.date),
      title: evento.title,
      description: evento.description,
    })),
  ].sort(
    (a, b) =>
      (a.date ? a.date.getTime() : Infinity) -
      (b.date ? b.date.getTime() : Infinity)
  );

  const projectStart = buildingStartDateFromToken
    ? new Date(buildingStartDateFromToken)
    : null;
  const projectEnd = buildingEndDateFromToken
    ? new Date(buildingEndDateFromToken)
    : null;

  const totalDays =
    projectStart && projectEnd
      ? (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
      : 0;

  const chartData = {
    labels: ["Pagado", "Pendiente"],
    datasets: [
      {
        data: [paidAmount, pendingAmountValue],
        backgroundColor: ["#ff8c00", "#e0e0e0"],
        borderColor: ["#ff8c00", "#e0e0e0"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (context.parsed.toFixed(2)) {
              label += `: ${new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
              }).format(context.parsed)}`;
            }
            return label;
          },
        },
      },
      // Nuevo plugin para el texto central
      centerText: {
        display: true,
        text: [
          new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
          }).format(paidAmount),
          new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
          }).format(estimatedPrice),
        ],
        color: "#363636",
        fontStyle: "bold",
        fontSize: [14, 14], // Tamaño de fuente para pagado y total
      },
    },
  };

   // Plugin personalizado para mostrar texto en el centro del Donut
  // Plugin personalizado para mostrar texto en el centro del Donut
 // Plugin personalizado para mostrar texto en el centro del Donut
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      if (chart.config.options.plugins.centerText.display) {
        const ctx = chart.ctx;
        const paidAmountFormatted = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(paidAmount);
        const remainingAmount = estimatedPrice - paidAmount;
        const remainingAmountFormatted = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(remainingAmount);

        const textLines = [paidAmountFormatted, remainingAmountFormatted]; // Cambiamos el texto de abajo
        const color = chart.config.options.plugins.centerText.color || "#000";
        const fontStyle =
            chart.config.options.plugins.centerText.fontStyle || "normal";
        const fontSizes =
            chart.config.options.plugins.centerText.fontSize || [20, 14]; // Aumentamos el tamaño del primero

        const defaultFontFamily = "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"; // Fuente por defecto si no hay otra definida
        const fontFamily = chart.config.options.font && chart.config.options.font.family ? chart.config.options.font.family : defaultFontFamily;

        const font = (size) => `${fontStyle} ${size}px ${fontFamily}`;
        const colors = ["#ff8c00", "#e0e0e0"]; // Colores naranja y gris
        const textX = chart.width / 2;
        const textY = chart.height / 2;
        const lineHeight = 25;

        ctx.save();
        ctx.textAlign = "center"; // Añade esta línea para centrar horizontalmente
        ctx.textBaseline = "middle"; // Añade esta línea para centrar verticalmente

        ctx.fillStyle = colors[0];
        ctx.font = font(fontSizes[0]);
        ctx.fillText(textLines[0], textX, textY - lineHeight / 2);

        ctx.fillStyle = colors[1]; // Asegúrate de usar el color correcto para el segundo texto
        ctx.font = font(fontSizes[1]);
        ctx.fillText(textLines[1], textX, textY + lineHeight / 2);

        ctx.restore();
      }
    },
  };

  // Registrar el plugin
  ChartJS.register(centerTextPlugin);

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <h2 className="text-start mb-4">
            HOLA, {clientNameFromToken || "Cliente"}:
          </h2>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="fs-4 fw-bold text-start mb-3">
                <PrecioEstimado precio={estimatedPrice} />
              </Card.Title>
              <div className="d-flex align-items-center mt-3">
                <div
                  className="position-relative"
                  style={{ width: "240px", height: "240px" }}
                >
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="position-absolute top-50 start-50 translate-middle text-center">
                    <div
                      className="fw-bold"
                      style={{ fontSize: "0.8rem" }}
                    ></div>
                    <div style={{ fontSize: "0.7rem", color: "#6c757d" }}></div>
                  </div>
                </div>
                <div className="ms-3">
                  <div className="d-flex align-items-center mb-2">
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor:
                          chartData.datasets[0].backgroundColor[0],
                        marginRight: "5px",
                      }}
                    ></div>
                    <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                      Pagado
                    </div>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor:
                          chartData.datasets[0].backgroundColor[1],
                        marginRight: "5px",
                      }}
                    ></div>
                    <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                      Pendiente
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="fs-5 fw-bold text-start mb-3">
                PLAZOS
              </Card.Title>
              <ListGroup variant="flush">
                {formattedPlazos.map((item, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex align-items-center"
                  >
                    <div
                      className="rounded-circle bg-secondary me-2"
                      style={{ width: "8px", height: "8px" }}
                    ></div>
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
          <h2 className="fs-4 fw-bold text-start mb-3">
            LÍNEA DE TIEMPO DEL PROYECTO
          </h2>
          <div style={{ overflowX: "auto" }}>
            <div
              className="position-relative"
              style={{
                height: "60px",
                width: `${Math.max(1, totalDays * 12)}px`,
              }}
              ref={timelineRef}
            >
              <div
                className="w-100 bg-secondary"
                style={{
                  height: "2px",
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              ></div>
              {projectStart &&
                projectEnd &&
                timelineItems.map((item, index) => {
                  if (!item.date) return null;
                  const totalDuration =
                    projectEnd.getTime() - projectStart.getTime();
                  const itemOffset =
                    item.date.getTime() - projectStart.getTime();
                  const percentage =
                    totalDuration > 0 ? (itemOffset / totalDuration) * 100 : 0;
                  const position = Math.max(0, Math.min(100, percentage));
                  return (
                    <div
                      key={index}
                      className="position-absolute"
                      style={{
                        left: `${position}%`,
                        transform: "translateX(-50%)",
                        top: "50%",
                        cursor: "pointer",
                      }}
                      onClick={() => handleEventClick(item)}
                    >
                      <div
                        className={`rounded-circle`}
                        style={{
                          width: "10px",
                          height: "10px",
                          backgroundColor: "#f5922c",
                        }}
                        title={item.title}
                      ></div>
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "0.8rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.title}
                      </div>
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
                    <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                      Dirección
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {buildingAddressFromToken ||
                        projectData.address ||
                        "Dirección no disponible"}
                    </div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex align-items-center">
                  <CalendarFill className="me-2 text-secondary" size={20} />
                  <div>
                    <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                      Fecha de inicio
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {formattedBuildingStartDate}
                    </div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex align-items-center">
                  <CalendarFill className="me-2text-secondary" size={20} />
                  <div>
                    <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                      Fecha de fin prevista
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {formattedBuildingEndDate}
                    </div>
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
