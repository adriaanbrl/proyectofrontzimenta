import React, { useState, useEffect } from "react";
import { Container, Card, ListGroup, Button } from "react-bootstrap";
import { PencilSquare, FileEarmarkText, Receipt, Clipboard, Shield, Book, Clock } from "react-bootstrap-icons";
import "./Profile.css";
import { jwtDecode } from "jwt-decode";
import ProfileImage from "../../TestProfileImage.js";
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const [username, setUsername] = useState("");
  const [surname, setSurname] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [building, setBuilding] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.name || "Usuario");
        setSurname(decodedToken.surname || "");
        setBuildingId(decodedToken.building_id || ""); // Assuming buildingId is in the JWT

        // Fetch building data if buildingId is available
        if (decodedToken.building_id) {
          fetchBuildingData(decodedToken.building_id);
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        setUsername("Usuario");
        setSurname("");
        setBuildingId("");
      }
    } else {
      setUsername("Usuario");
      setSurname("");
      setBuildingId("");
    }
  }, []);

  const fetchBuildingData = async (building_id) => {
    try {
      const response = await fetch(`http://localhost:8080/auth/building/${building_id}`); // Replace with your backend API URL
      if (response.ok) {
        const data = await response.json();
        setBuilding(data);
        console.log("Building Data:", data); // Log the building data
      } else {
        console.error("Error al obtener los datos del edificio:", response.status);
      }
    } catch (error) {
      console.error("Error de red al obtener los datos del edificio:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
      <Container className="py-4">
        {/* Sección del usuario */}
        <Card className="mb-3 text-center border-2 card-custom">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <ProfileImage username={username} />
              <div className="flex-grow-1 ms-3">
                <h4 className="mb-0">{username} {surname}</h4> {/* Display username and surname */}
                {building && <p className="mb-0 text-muted">Edificio ID: {building.id}</p>} {/* Optional: Display building ID */}
              </div>
              <PencilSquare size={24} className="text-custom" />
            </div>
          </Card.Body>
        </Card>

        {/* Lista de opciones */}
        <ListGroup variant="flush">
          <Link to="/documentacion" state={{ buildingId: buildingId }}> {/* Pass buildingId as state */}
            <ListGroup.Item className="d-flex align-items-center">
              <FileEarmarkText size={20} className="text-custom me-2" />
              Documentación Legal
            </ListGroup.Item>
          </Link>
          <ListGroup.Item className="d-flex align-items-center">
            <Receipt size={20} className="text-custom me-2" />
            Facturas
          </ListGroup.Item>
          <ListGroup.Item className="d-flex align-items-center">
            <Clipboard size={20} className="text-custom me-2" />
            Presupuestos
          </ListGroup.Item>
          <ListGroup.Item className="d-flex align-items-center">
            <Shield size={20} className="text-custom me-2" />
            Garantía
          </ListGroup.Item>
          <ListGroup.Item className="d-flex align-items-center">
            <Book size={20} className="text-custom me-2" />
            Manual de usuario de la Vivienda
          </ListGroup.Item>
          <ListGroup.Item className="d-flex align-items-center">
            <Clock size={20} className="text-custom me-2" />
            Historial de Incidencias
          </ListGroup.Item>
        </ListGroup>

        {/* Botón de Cerrar Sesión */}
        <div className="text-center mt-3">
          <Button variant="outline-warning" className="btn-outline-custom w-100 fw-bold" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </Container>
  );
}