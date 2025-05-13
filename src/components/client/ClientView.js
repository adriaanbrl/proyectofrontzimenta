import React, { useState, useEffect, useRef, useCallback } from "react";
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


// Componente para mostrar el precio estimado con opción de ver/ocultar
const PrecioEstimado = ({ precio }) => {
  const [verPrecio, setVerPrecio] = useState(false);


  const toggleVerPrecio = () => setVerPrecio(!verPrecio);


  const formatearPrecio = (precio) =>
      new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(precio);


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


// Componente principal para la vista del cliente
const ClientView = () => {
  // Estados
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
  const [modalVisible, setModalVisible] = useState(false);
  const [eventoModal, setEventoModal] = useState(null);
  const [budgetAmount, setBudgetAmount] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);
  const [verDetallePago, setVerDetallePago] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [lastInvoiceLoading, setLastInvoiceLoading] = useState(false);
  const [lastInvoiceError, setLastInvoiceError] = useState(null);
  const [invoicePdfUrl, setInvoicePdfUrl] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const timelineRef = useRef(null);


  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    try {
      const date = new Date(dateString);
      return date
          .toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
          .replace(/ de /g, " "); // Elimina " de " para mayor brevedad
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha inválida";
    }
  };


  // Función para obtener eventos
  const fetchEvents = useCallback(async (buildingId, year, month) => {
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
  }, []);


  // Función para obtener el presupuesto
  const fetchBudget = useCallback(async (buildingId) => {
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
  }, []);


  // Función para obtener el monto de la factura
  const fetchInvoiceAmount = useCallback(async (buildingId) => {
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
  }, []);


  // Función para obtener la última factura
  const fetchLastInvoice = useCallback(async (buildingId) => {
    setLastInvoiceLoading(true);
    setLastInvoiceError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token de autenticación.");
      const response = await axios.get(
          `http://localhost:8080/api/invoices/last/${buildingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
      );


      if (response.status !== 200) {
        throw new Error(
            `Error al obtener la última factura: ${response.status}`
        );
      }


      if (response.data) {
        setLastInvoice(response.data);
        setInvoicePdfUrl(`http://localhost:8080/api/invoices/last/${buildingId}`);
      } else {
        setLastInvoiceError(new Error("No se encontró la última factura."));
        setLastInvoice(null);
        setInvoicePdfUrl(null);
      }
    } catch (err) {
      console.error("Error fetching last invoice:", err);
      setLastInvoiceError(err);
      setLastInvoice(null);
      setInvoicePdfUrl(null);
    } finally {
      setLastInvoiceLoading(false);
    }
  }, []);


  // Efecto para obtener los datos iniciales al cargar el componente
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
        await fetchInvoiceAmount(buildingId);
        await fetchLastInvoice(buildingId);
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
  }, [fetchBudget, fetchEvents, fetchInvoiceAmount, fetchLastInvoice]); // Dependencias para que el efecto se ejecute cuando cambian.


  // Efecto para obtener eventos cuando cambia el mes
  useEffect(() => {
    if (buildingIdFromToken) {
      fetchEvents(
          buildingIdFromToken,
          eventMonth.getFullYear(),
          eventMonth.getMonth() + 1
      );
    }
  }, [buildingIdFromToken, eventMonth, fetchEvents]);


  // Handlers para la UI
  const handleCloseModal = () => {
    setModalVisible(false);
    setEventoModal(null);
  };


  const handleEventClick = (item) => {
    setEventoModal(item);
    setModalVisible(true);
  };


  const handleOpenPdf = async () => {
    if (lastInvoice && lastInvoice.id) {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
            `http://localhost:8080/api/invoices/pdf/${lastInvoice.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          URL.revokeObjectURL(url); // Limpiar la URL del objeto después de abrir
        } else if (response.status === 401 || response.status === 403) {
          // Manejar errores de autenticación/autorización
          console.error("No autorizado para ver la factura:", response.status);
          alert("No tienes permiso para ver esta factura. Por favor, inicia sesión nuevamente.");
          // Aquí podrías redirigir al usuario a la página de login si es necesario
        } else {
          console.error("Error al obtener el PDF:", response.status);
          alert("Error al cargar la factura.");
        }
      } catch (error) {
        console.error("Error al obtener el PDF:", error);
        alert("Error al cargar la factura.");
      }
    } else {
      alert('No se puede obtener la URL de la factura.');
    }
  };


  const toggleVerDetallePago = () => {
    setVerDetallePago(!verDetallePago);
  };


  // Renderizado condicional durante la carga de datos
  if (loading || budgetLoading || invoiceLoading || lastInvoiceLoading) {
    return <div>Cargando datos...</div>;
  }


  // Renderizado condicional en caso de error
  if (error || lastInvoiceError) {
    return (
        <div>
          Error al cargar los datos del proyecto: {error?.message || ""}
          {lastInvoiceError?.message}
        </div>
    );
  }


  // Renderizado condicional si no hay datos del proyecto
  if (!projectData) {
    return <div>No se encontraron datos para este proyecto.</div>;
  }


  // Desestructuración de datos del proyecto
  const {
    paidAmount: projectPaidAmount,
    deadlines,
    projectPhases,
  } = projectData;


  // Cálculo de montos y progreso
  const estimatedPrice =
      budgetAmount !== null ? budgetAmount : projectData.estimatedPrice || 0;
  const paidAmount =
      invoiceAmount !== null ? invoiceAmount : projectPaidAmount || 0;
  const paymentProgress =
      estimatedPrice === 0 ? 0 : (paidAmount / estimatedPrice) * 100;
  const pendingAmountValue = estimatedPrice - paidAmount;


  // Formateo de montos para visualización
  const formattedPendingAmountForGraph = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(pendingAmountValue);
  const formattedPaidAmountForGraph = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(paidAmount);


  // Formateo de fechas de inicio y fin del proyecto
  const formattedBuildingStartDate = formatDate(buildingStartDateFromToken);
  const formattedBuildingEndDate = formatDate(buildingEndDateFromToken);


  // Formateo de plazos y fases del proyecto
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


  // Combinación y ordenamiento de eventos y fases para la línea de tiempo
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


  // Cálculo de fechas de inicio y fin del proyecto
  const projectStart = buildingStartDateFromToken
      ? new Date(buildingStartDateFromToken)
      : null;
  const projectEnd = buildingEndDateFromToken
      ? new Date(buildingEndDateFromToken)
      : null;


  // Cálculo de la duración total del proyecto en días
  const totalDays =
      projectStart && projectEnd
          ? (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)
          : 0;


  // Datos para el gráfico de Doughnut
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


  // Opciones para el gráfico de Doughnut
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


      centerText: {
        display: verDetallePago,
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
        fontSize: [14, 14],
      },
    },
  };


  // Plugin para mostrar texto en el centro del gráfico
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


        const textLines = [paidAmountFormatted, remainingAmountFormatted];
        const color = chart.config.options.plugins.centerText.color || "#000";
        const fontStyle =
            chart.config.options.plugins.centerText.fontStyle || "normal";
        const fontSizes = chart.config.options.plugins.centerText.fontSize || [
          20, 14,
        ];
        const defaultFontFamily =
            "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
        const fontFamily =
            chart.config.options.font && chart.config.options.font.family
                ? chart.config.options.font.family
                : defaultFontFamily;


        const font = (size) => `${fontStyle} ${size}px ${fontFamily}`;
        const colors = ["#ff8c00", "#e0e0e0"];
        const textX = chart.width / 2;
        const textY = chart.height / 2;
        const lineHeight = 25;


        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";


        ctx.fillStyle = colors[0];
        ctx.font = font(fontSizes[0]);
        ctx.fillText(textLines[0], textX, textY - lineHeight / 2);


        ctx.fillStyle = colors[1];
        ctx.font = font(fontSizes[1]);
        ctx.fillText(textLines[1], textX, textY + lineHeight / 2);


        ctx.restore();
      }
    },
  };
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
                  </div>
                  <div className="ms-3">
                    <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                      <div
                          style={{ cursor: "pointer" }}
                          onClick={toggleVerDetallePago}
                      >
                        {verDetallePago ? (
                            <EyeFill size={20} />
                        ) : (
                            <EyeSlashFill size={20} />
                        )}
                        Visualizar
                      </div>
                    </div>
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
                  ULTIMA FACTURA
                </Card.Title>
                <ListGroup variant="flush">
                  {lastInvoice ? (
                      <>
                        <ListGroup.Item>
                          <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                            Mes de la Factura:
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {lastInvoice.title}
                          </div>
                          <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                            Monto:
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'EUR',
                            }).format(lastInvoice.amount)}
                          </div>
                        </ListGroup.Item>
                        {invoicePdfUrl && (
                            <ListGroup.Item>
                              <Button
                                  variant="outline-primary"
                                  onClick={handleOpenPdf}
                                  style={{ fontSize: '0.8rem' }}
                              >
                                Ver Factura
                              </Button>
                            </ListGroup.Item>
                        )}
                      </>
                  ) : (
                      <ListGroup.Item>No hay facturas disponibles</ListGroup.Item>
                  )}
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
            <div style={{ overflowX: 'auto' }}>
              <div
                  className="position-relative"
                  style={{
                    height: '80px',
                    width: `${Math.max(1, timelineItems.length * 100)}px`,
                    paddingLeft: '20px',
                  }}
                  ref={timelineRef}
              >
                <div
                    className="w-100 bg-secondary"
                    style={{
                      height: '2px',
                      position: 'absolute',
                      top: '50%',
                      left: '0%',
                      width: '100%',
                    }}
                ></div>
                {timelineItems.map((item, index) => {
                  if (!item.date) return null;
                  let position;
                  const firstElementOffset = 4;
                  if (timelineItems.length > 1) {
                    const availableSpace = 100 - firstElementOffset;
                    const spacing = availableSpace / (timelineItems.length - 1);
                    position = firstElementOffset + index * spacing;
                  } else {
                    position = 50;
                  }
                  const titleTop = index % 2 === 0 ? '-20px' : '20px';
                  const titleTextAlign = 'center';
                  return (
                      <div
                          key={index}
                          className="position-absolute"
                          style={{
                            left: `${position}%`,
                            top: '50%',
                            cursor: 'pointer',
                            transform: 'translateX(-50%) translateY(-50%)',
                          }}
                          onClick={() => handleEventClick(item)}
                      >
                        <div
                            className={`rounded-circle`}
                            style={{
                              width: '10px',
                              height: '10px',
                              backgroundColor: '#f5922c',
                            }}
                            title={item.title}
                        ></div>
                        <div
                            style={{
                              position: 'absolute',
                              top: titleTop,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap',
                              textAlign: titleTextAlign,
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
        <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Factura</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {invoicePdfUrl && (
                <iframe
                    src={invoicePdfUrl}
                    style={{ width: "100%", height: "500px" }}
                    title="Invoice PDF"
                />
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPdfModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};

export default ClientView;
