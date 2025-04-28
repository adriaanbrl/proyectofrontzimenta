import React, { useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { FaPencilAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./EventCalendar.css";

const EventCalendar = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date(2025, 7, 17)
  );
  const [mesActual, setMesActual] = useState(new Date());
  const [eventosProximos, setEventosProximos] = useState([
    { fecha: new Date(2025, 2, 17), titulo: "CIMENTACIÓN" },
  ]);

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


  return (
    <Container className="calendario-eventos p-3">
     

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

      <div className="proximos-eventos">
        <h2 className="h6 mb-3">PROXIMOS EVENTOS</h2>
        {eventosProximos.map((evento, index) => (
          <Card key={index} className="mb-2">
            <Card.Body className="p-2">
              <Card.Title className="small fw-bold">
                {formatearFecha(evento.fecha)}
              </Card.Title>
              <Card.Text className="small">{evento.titulo}</Card.Text>
            </Card.Body>
          </Card>
        ))}
        {eventosProximos.length === 0 && (
          <p className="small text-muted">No hay próximos eventos.</p>
        )}
      </div>
    </Container>
  );
};

export default EventCalendar;