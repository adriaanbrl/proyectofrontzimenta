import React from "react";
import { Container, Card, ListGroup, Button } from "react-bootstrap";
import { PersonCircle, PencilSquare, FileEarmarkText, Receipt, Clipboard, Shield, Book, Clock } from "react-bootstrap-icons";

export default function Profile() {
  return (
    <Container className="py-4">
      {/* Sección del usuario */}
      <Card className="mb-3 text-center border-2 border-warning">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between">
            <PersonCircle size={50} className="text-warning" />
            <div className="flex-grow-1 ms-3">
              <h4 className="mb-0">Tomás Miranda</h4>
            </div>
            <PencilSquare size={24} className="text-warning" />
          </div>
        </Card.Body>
      </Card>

      {/* Lista de opciones */}
      <ListGroup variant="flush">
        <ListGroup.Item className="d-flex align-items-center">
          <FileEarmarkText size={20} className="text-warning me-2" />
          Documentación Legal
        </ListGroup.Item>
        <ListGroup.Item className="d-flex align-items-center">
          <Receipt size={20} className="text-warning me-2" />
          Facturas
        </ListGroup.Item>
        <ListGroup.Item className="d-flex align-items-center">
          <Clipboard size={20} className="text-warning me-2" />
          Presupuestos
        </ListGroup.Item>
        <ListGroup.Item className="d-flex align-items-center">
          <Shield size={20} className="text-warning me-2" />
          Garantía
        </ListGroup.Item>
        <ListGroup.Item className="d-flex align-items-center">
          <Book size={20} className="text-warning me-2" />
          Manual de usuario de la Vivienda
        </ListGroup.Item>
        <ListGroup.Item className="d-flex align-items-center">
          <Clock size={20} className="text-warning me-2" />
          Historial de Incidencias
        </ListGroup.Item>
      </ListGroup>

      {/* Botón de Cerrar Sesión */}
      <div className="text-center mt-3">
        <Button variant="outline-warning" className="w-100 fw-bold">
          Cerrar Sesión
        </Button>
      </div>
    </Container>
  );
}
