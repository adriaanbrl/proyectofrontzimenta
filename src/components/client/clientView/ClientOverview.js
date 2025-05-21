import React, { useState } from "react";
import { Card, ListGroup, Button, Col } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

ChartJS.register(ArcElement, Tooltip, Legend);

const centerTextPlugin = {
  id: "centerText",
  beforeDraw: (chart) => {
    if (chart.config.options.plugins.centerText.display) {
      const ctx = chart.ctx;
      const { paidAmount, estimatedPrice } = chart.config.options.plugins.centerText.data;

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
            if (typeof context.parsed === 'number') {
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
    <>
      <Col md={6}>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title className="fs-4 fw-bold text-start mb-3">
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
      <Col md={6}>
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title className="fs-5 fw-bold text-start mb-3">
              ULTIMA FACTURA
            </Card.Title>
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <img
                src="/img/facturanaranja.png"
                alt="Factura Naranja"
                className="w-50"
              />
              <ListGroup variant="flush" style={{ flex: 1 }}>
                {lastInvoice ? (
                  <>
                    <ListGroup.Item>
                      <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                        Mes de la Factura:
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {lastInvoice.title}
                      </div>
                      <div className="fw-bold" style={{ fontSize: "0.9rem" }}>
                        Monto:
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        }).format(lastInvoice.amount)}
                      </div>
                    </ListGroup.Item>
                    {lastInvoice.id && (
                      <ListGroup.Item>
                        <Button
                          variant="primary"
                          onClick={handleOpenPdf}
                          style={{ fontSize: "0.8rem" }}
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
            </div>
          </Card.Body>
        </Card>
      </Col>
    </>
  );
};

export default ClientOverview;