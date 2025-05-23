// src/components/client/EstimatedPrice.js
import React, { useState } from "react";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import { Col, Row } from "react-bootstrap";
import "./ClientView.css";

const EstimatedPrice = ({ precio }) => {
  const [verPrecio, setVerPrecio] = useState(false);

  const toggleVerPrecio = () => setVerPrecio(!verPrecio);

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(precio);

  return (
    <div>
      <Row className="align-items-center mb-2">
        <Col xs="auto">
          <div onClick={toggleVerPrecio} style={{ cursor: "pointer" }}>
            {verPrecio ? <EyeFill size={20} /> : <EyeSlashFill size={20} />}
          </div>
        </Col>
        <Col className="fs-5 fw-bold text-start">PRECIO ESTIMADO</Col>
      </Row>
      <div
        className={`fs-4 fw-bold ${!verPrecio ? "opacity-50" : ""}`}
        style={{ color: "#ff8c00" }}
      >
        {verPrecio && precio !== null ? formatearPrecio(precio) : "********"}
      </div>
    </div>
  );
};

export default EstimatedPrice;
