import React, { useState, useEffect } from "react";
import {
  Card,
  ListGroup,
  Button,
  Col,
  Row,
  Stack,
  Badge,
} from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  EyeFill,
  EyeSlashFill,
  FileEarmarkTextFill,
} from "react-bootstrap-icons";
import EstimatedPrice from "./EstimatedPrice"; // Importa EstimatedPrice aquí
import { CalendarEventFill } from "react-bootstrap-icons"; // Importa el icono aquí

ChartJS.register(ArcElement, Tooltip, Legend);

const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart) => {
    if (chart.config.options.plugins.centerText.display) {
      const ctx = chart.ctx;
      const { paidAmount, estimatedPrice } =
        chart.config.options.plugins.centerText.data;

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
      const fontStyle = "bold";
      const fontSizes = [14, 14];
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

const ClientOverview = ({
  estimatedPrice,
  paidAmount,
  pendingAmountValue,
  lastInvoice,
  fetchLastInvoice,
  buildingId, 
}) => {
   console.log("Building ID recibido:", buildingId); 
  const [verDetallePago, setVerDetallePago] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState(null);

  const toggleVerDetallePago = () => setVerDetallePago(!verDetallePago);

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
          window.open(url, "_blank");
          URL.revokeObjectURL(url);
        } else if (response.status === 401 || response.status === 403) {
          console.error("No autorizado para ver la factura:", response.status);
          alert(
            "No tienes permiso para ver esta factura. Por favor, inicia sesión nuevamente."
          );
        } else {
          console.error("Error al obtener el PDF:", response.status);
          alert("Error al cargar la factura.");
        }
      } catch (error) {
        console.error("Error al obtener el PDF:", error);
        alert("Error al cargar la factura.");
      }
    } else {
      alert("No se puede obtener la URL de la factura.");
    }
  };

  const chartData = {
    labels: ["Pagado", "Pendiente"],
    datasets: [
      {
        data: [paidAmount, Number(pendingAmountValue)],
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
            if (typeof context.parsed === "number") {
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
        data: { paidAmount, estimatedPrice },
      },
    },
  };

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      if (!buildingId) {
        setLoadingEvents(false);
        return;
      }

      setLoadingEvents(true);
      setErrorEvents(null);
      const token = localStorage.getItem("authToken");

      try {
        const response = await fetch(
          `http://localhost:8080/auth/building/${buildingId}/events`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUpcomingEvents(data);
        } else {
          setErrorEvents("Error al cargar los próximos eventos.");
          console.error("Error al obtener los próximos eventos:", response.status);
        }
      } catch (error) {
        setErrorEvents("Error de conexión al cargar los próximos eventos.");
        console.error("Error al obtener los próximos eventos:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchUpcomingEvents();
  }, [buildingId]); // Dependencia en buildingId para recargar si cambia

  return (
    <Row className="h-100 ">
      <Col md={6} xs={12}>
        <Card className="shadow-sm h-100 d-flex flex-column">
          <Card.Body className="d-flex flex-column align-items-start flex-grow-1">
            <div className="mb-3">
              <EstimatedPrice precio={estimatedPrice} />
            </div>
            <div className="d-flex align-items-center mt-3 flex-grow-1">
              {" "}
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
                    {verDetallePago ? <EyeFill size={20} /> : <EyeSlashFill size={20} />}
                    Visualizar
                  </div>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: chartData.datasets[0].backgroundColor[0],
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
                      backgroundColor: chartData.datasets[0].backgroundColor[1],
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
      <Col md={6} xs={12} className="d-flex flex-column gap-3">
        <Card className="shadow-sm">
          <Card.Body className="d-flex flex-column justify-content-between">
            <div>
              <Card.Title className="mb-3 fw-semibold d-flex align-items-center">
                <FileEarmarkTextFill className="me-2 text-custom" size={20} />
                Última Factura
              </Card.Title>
              {lastInvoice ? (
                <Stack gap={1}>
                  <div>
                    <span className="text-muted">Mes:</span>{" "}
                    <Badge pill bg="light" text="custom" className="ms-1">
                      {lastInvoice.title}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted">Monto:</span>{" "}
                    <span className="text-custom fw-bold">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      }).format(lastInvoice.amount)}
                    </span>
                  </div>
                </Stack>
              ) : (
                <div className="text-muted small">
                  No hay facturas disponibles.
                </div>
              )}
            </div>
            {lastInvoice?.id && (
              <div>
                <Button
                  variant="outline-custom"
                  size="md"
                  onClick={handleOpenPdf}
                  className="rounded-pill mt-3"
                >
                  <FileEarmarkTextFill className="me-2 " /> Ver Factura
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Body className="d-flex flex-column justify-content-between">
            <div>
              <Card.Title className="mb-3 fw-semibold d-flex align-items-center">
                <CalendarEventFill className="me-2 text-custom " size={20} />
                Próximos Eventos
              </Card.Title>
              {loadingEvents ? (
                <div className="text-muted small">Cargando eventos...</div>
              ) : errorEvents ? (
                <div className="text-danger small">{errorEvents}</div>
              ) : upcomingEvents.length > 0 ? (
                <ListGroup variant="flush">
                  {upcomingEvents.map((event) => (
                    <ListGroup.Item key={event.id}>
                      <div className="fw-bold">{event.title}</div>
                      <div className="text-muted small">
                        {new Date(event.date).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      {event.description && <div className="text-muted small">{event.description}</div>}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-muted small">No hay eventos para este edificio.</div>
              )}
            </div>
            {upcomingEvents.length > 0 && (
              <div>
                <Button
                  variant="outline-custom"
                  size="md"
                  className="rounded-pill mt-3"
                  onClick={() => {
                    console.log("Ver todos los eventos del edificio");
                  }}
                >
                  Ver Todos los Eventos
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ClientOverview;