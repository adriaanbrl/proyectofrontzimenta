import React, { useState, useEffect, useRef } from "react";
import { Container, Card, ListGroup, Button, Modal } from "react-bootstrap";
import {
  PencilSquare,
  FileEarmarkText,
  Receipt,
  Clipboard,
  Book,
  Clock,
  ImageFill,
} from "react-bootstrap-icons";
import "./Profile.css";
import { jwtDecode } from "jwt-decode";
import ProfileImage from "../../TestProfileImage.js";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const [username, setUsername] = useState("");
  const [surname, setSurname] = useState("");
  const [buildingId, setBuildingId] = useState(""); 
  const [building, setBuilding] = useState("");
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const fetchBuildingData = async (building_id) => {
    try {
      const token = localStorage.getItem("authToken"); // Obtener el token

      if (!token) {
      
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

    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.name || "Usuario");
        setSurname(decodedToken.surname || "");
        setBuildingId(decodedToken.building_id || "");
      
        if (decodedToken.building_id) {
          fetchBuildingData(decodedToken.building_id);
        }
      } catch (error) {

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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleEditClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null); 
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {

      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
   
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", selectedImage);

    try {
      const response = await axios.post(
          "http://localhost:8080/auth/profile/upload-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
      );


      setShowModal(false);
      setSelectedImage(null);

      window.location.reload();
    } catch (error) {

    }
  };

  const handleOpenFileExplorer = () => {
    fileInputRef.current.click();
  };

  return (
      <Container className="py-4">
        <Card className="mb-3 text-center border-2 card-custom">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <ProfileImage username={username} />
              <div className="flex-grow-1 ms-3">
                <h4 className="mb-0">
                  {username} {surname}
                </h4>{" "}
                {building && (
                    <p className="mb-0 text-muted">Edificio ID: {buildingId}</p>
                )}{" "}
              </div>
              <PencilSquare
                  size={24}
                  className="text-custom"
                  onClick={handleEditClick}
                  style={{ cursor: "pointer" }}
              />
            </div>
          </Card.Body>
        </Card>

        {/* Modal para seleccionar la imagen */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Seleccionar Foto de Perfil</Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex flex-column align-items-center">
            {selectedImage && (
                <div className="mb-3">
                  <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Imagen seleccionada"
                      style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "50%", objectFit: "cover" }}
                  />
                </div>
            )}
            <Button variant="outline-info" className="mb-2" onClick={handleOpenFileExplorer}>
              <ImageFill className="me-2" />
              Seleccionar Archivo
            </Button>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="d-none"
                ref={fileInputRef}
            />
            {selectedImage && (
                <Button variant="primary" onClick={handleUploadImage}>
                  Subir Imagen
                </Button>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>

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
          <Link to="/manual" state={{ building_id: buildingId }}>
            {" "}
            <ListGroup.Item className="d-flex align-items-center">
              <Book size={20} className="text-custom me-2" />
              Manual de usuario de la Vivienda
            </ListGroup.Item>
          </Link>
          <Link to="/garantia" state={{ building_id: buildingId }}>
            {" "}
            <ListGroup.Item className="d-flex align-items-center">
              <PencilSquare size={20} className="text-custom me-2" />
              Incidencias
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