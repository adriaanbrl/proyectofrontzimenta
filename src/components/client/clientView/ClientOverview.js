import React, { useState } from "react";
import { Card, ListGroup, Button, Col, Row } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  EyeFill,
  EyeSlashFill,
  FileEarmarkTextFill,
} from "react-bootstrap-icons";
import EstimatedPrice from "./EstimatedPrice"; // Importa EstimatedPrice aquí

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
}) => {
  const [verDetallePago, setVerDetallePago] = useState(false);

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

  return (
    <Row className="h-100 align-items-stretch">
      <Col md={6} className="h-100">
        <Card className="shadow-sm h-100 d-flex flex-column">
          <Card.Body className="d-flex flex-column align-items-start flex-grow-1">
            <div className="mb-3">
              <EstimatedPrice precio={estimatedPrice} />
            </div>
            <div className="d-flex align-items-center mt-3 flex-grow-1">
              {" "}
              {/* Añade flex-grow-1 aquí */}
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
            {/* El flex-grow-1 en Card.Body debería hacer que ocupe el espacio */}
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} className="h-100">
        <Card className="shadow-sm h-100 d-flex flex-column">
          <Card.Body className="d-flex flex-column flex-grow-1">
            <Card.Title className="fs-5 fw-bold text-start mb-3">
              ULTIMA FACTURA
            </Card.Title>

            <Row className="align-items-center flex-grow-1">
              <Col
                md="auto"
                xs="auto"
                className="me-4 d-flex justify-content-center align-items-center"
              >
                <FileEarmarkTextFill
                  size={150}
                  width={150}
                  color="#ff8c00"
                  className="ms-3"
                />
              </Col>

              <Col
                md={true}
                xs="auto"
                className="d-flex flex-column flex-grow-1"
              >
                <div className="d-flex flex-column justify-content-center flex-grow-1">
                  {" "}
                  {/* Contenedor adicional */}
                  {lastInvoice ? (
                    <>
                      <div>
                        <div className="fw-bold small">Mes de la Factura:</div>
                        <div className="text-muted small">
                          {lastInvoice.title}
                        </div>
                        <div className="fw-bold small mt-2">Monto:</div>
                        <div className="text-muted small">
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          }).format(lastInvoice.amount)}
                        </div>
                      </div>
                      {lastInvoice.id && (
                        <div className="mt-3">
                          {" "}
                          {/* Añade un margen superior */}
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleOpenPdf}
                          >
                            Ver Factura
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div>No hay facturas disponibles</div>
                  )}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ClientOverview;
