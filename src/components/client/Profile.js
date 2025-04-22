import React, { useState, useEffect } from "react";
import { Container, Card, ListGroup, Button } from "react-bootstrap";
import {
  PencilSquare,
  FileEarmarkText,
  Receipt,
  Clipboard,
  Shield,
  Book,
  Clock,
} from "react-bootstrap-icons";
import "./Profile.css";
import { jwtDecode } from "jwt-decode";
import ProfileImage from "../../TestProfileImage.js";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios

export default function Profile() {
  const [username, setUsername] = useState(""); // Estado para almacenar el nombre de usuario.
  const [surname, setSurname] = useState(""); // Estado para almacenar el apellido del usuario.
  const [buildingId, setBuildingId] = useState(""); // Estado para almacenar el ID del edificio del usuario.
  const [building, setBuilding] = useState(""); // Estado para almacenar los datos del edificio.
  const navigate = useNavigate(); // Hook para la navegación entre rutas.

  const fetchBuildingData = async (building_id) => {
    try {
      const token = localStorage.getItem("authToken"); // Obtener el token

      if (!token) {
        console.error("No se encontró el token de autenticación.");
        return;
      }

      // Realiza una petición GET a la API para obtener los datos del edificio.
      // Incluye el token en el encabezado 'Authorization' como un token Bearer.
      const response = await axios.get(
        `http://localhost:8080/auth/building/${building_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Añadir el token al encabezado
          },
        }
      );
      // Actualiza el estado 'building' con los datos recibidos de la API
      setBuilding(response.data);
    } catch (error) {
      console.error("Error al obtener los datos del edificio:", error);
    }
  };

  useEffect(() => {
    // Obtiene el token de autenticación del almacenamiento local
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        // Decodifica el token JWT para acceder a su contenido.
        const decodedToken = jwtDecode(token);
        // Actualiza los estados con la información del usuario extraída del token.
        setUsername(decodedToken.name || "Usuario");
        setSurname(decodedToken.surname || "");
        setBuildingId(decodedToken.building_id || ""); // Assuming buildingId is in the JWT

        console.log(
          "building_id recibido del customer (JWT):",
          decodedToken.building_id
        ); // <-------------------- AÑADIDO CONSOLE LOG

        // Si el ID del edificio está presente en el token, llama a la función para obtener los datos del edificio.
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

  // Función para cerrar la sesión del usuario.
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
              <h4 className="mb-0">
                {username} {surname}
              </h4>{" "}
              {/* Display username and surname */}
              {building && (
                <p className="mb-0 text-muted">Edificio ID: {buildingId}</p>
              )}{" "}
              {/* Optional: Display building ID */}
            </div>
            <PencilSquare size={24} className="text-custom" />
          </div>
        </Card.Body>
      </Card>

      {/* Lista de opciones */}
      <ListGroup variant="flush">
        <Link to="/documentacion" state={{ building_id: buildingId }}>
          {" "}
          <ListGroup.Item className="d-flex align-items-center">
            <FileEarmarkText size={20} className="text-custom me-2" />
            Documentación Legal
          </ListGroup.Item>
        </Link>
        <Link to="/factura" state={{ building_id: buildingId }}>
          {" "}
          <ListGroup.Item className="d-flex align-items-center">
            <Receipt size={20} className="text-custom me-2" />
            Facturas
          </ListGroup.Item>
        </Link>
        <Link to="/presupuesto" state={{ building_id: buildingId }}>
          {" "}
          <ListGroup.Item className="d-flex align-items-center">
            <Clipboard size={20} className="text-custom me-2" />
            Presupuestos
          </ListGroup.Item>
        </Link>
        <Link to="/garantia" state={{ building_id: buildingId }}>
          {" "}
          <ListGroup.Item className="d-flex align-items-center">
            <Shield size={20} className="text-custom me-2" />
            Garantía
          </ListGroup.Item>
        </Link>
        <Link to="/manual" state={{ building_id: buildingId }}>
          {" "}
          <ListGroup.Item className="d-flex align-items-center">
            <Book size={20} className="text-custom me-2" />
            Manual de usuario de la Vivienda
          </ListGroup.Item>
        </Link>
        <Link to="/historial" state={{ building_id: buildingId }}>
          {" "}
          <ListGroup.Item className="d-flex align-items-center">
            <Clock size={20} className="text-custom me-2" />
            Historial de Incidencias
          </ListGroup.Item>
        </Link>
      </ListGroup>

      {/* Botón de Cerrar Sesión */}
      <div className="text-center mt-3">
        <Button
          variant="outline-warning"
          className="btn-outline-custom w-100 fw-bold"
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </div>
    </Container>
  );
}
