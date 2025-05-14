import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Modal,
} from "react-bootstrap";

function ClientGallery() {
  const [groupedImages, setGroupedImages] = useState({});
  const [buildingIdFromToken, setBuildingIdFromToken] = useState(null);
  const [loadingBuildingId, setLoadingBuildingId] = useState(true);
  const [errorBuildingId, setErrorBuildingId] = useState(null);
  const [loadingImages, setLoadingImages] = useState(true);
  const [errorImages, setErrorImages] = useState(null);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [buildingPlanUrl, setBuildingPlanUrl] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [errorPlan, setErrorPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setBuildingIdFromToken(decodedToken.building_id || null);
      } catch (error) {
        setErrorBuildingId("Error al leer la información del edificio.");
      } finally {
        setLoadingBuildingId(false);
      }
    } else {
      setErrorBuildingId("No se encontró el token de autenticación.");
      setLoadingBuildingId(false);
    }
  }, []);

  useEffect(() => {
    const fetchBuildingImages = async () => {
      if (buildingIdFromToken) {
        setLoadingImages(true);
        setErrorImages(null);
        try {
          const url = `http://localhost:8080/api/buildings/${buildingIdFromToken}/images`;
          const token = localStorage.getItem("authToken");
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const grouped = data.reduce((acc, image) => {
            const roomId = image.roomId || "sin_habitacion";
            if (!acc[roomId]) {
              acc[roomId] = {
                name: image.roomName || "Sin Habitación",
                images: [],
              };
            }
            acc[roomId].images.push(image);
            return acc;
          }, {});
          setGroupedImages(grouped);
        } catch (error) {
          console.error(
            `Error fetching imágenes del edificio ${buildingIdFromToken}:`,
            error
          );
          setErrorImages("Error al cargar las imágenes.");
          setGroupedImages({});
        } finally {
          setLoadingImages(false);
        }
      }
    };

    fetchBuildingImages();
  }, [buildingIdFromToken]);

  useEffect(() => {
    const fetchBuildingPlan = async () => {
      if (buildingIdFromToken) {
        setLoadingPlan(true);
        setErrorPlan(null);
        try {
          const url = `http://localhost:8080/api/buildings/${buildingIdFromToken}/planos`;
          const token = localStorage.getItem("authToken");
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const urlCreator = window.URL || window.webkitURL;
            const imageUrl = urlCreator.createObjectURL(blob);
            setBuildingPlanUrl(imageUrl);
          } else if (response.status === 404) {
            setBuildingPlanUrl(null);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error(
            `Error fetching plano del edificio ${buildingIdFromToken}:`,
            error
          );
          setErrorPlan("Error al cargar el plano.");
          setBuildingPlanUrl(null);
        } finally {
          setLoadingPlan(false);
        }
      }
    };

    fetchBuildingPlan();
  }, [buildingIdFromToken]);

  const toggleRoomExpansion = (roomId) => {
    setExpandedRoom((prevExpandedRoom) =>
      prevExpandedRoom === roomId ? null : roomId
    );
    setSelectedImage(null);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleShowPlanModal = () => setShowPlanModal(true);
  const handleClosePlanModal = () => setShowPlanModal(false);

  const lastRoomId =
    Object.keys(groupedImages)[Object.keys(groupedImages).length - 1];

  return (
    <Container className="client-gallery-container">
      <h1
        className="fw-bold"
        style={{ color: "#f5922c", marginBottom: "20px" }}
      >
        Galería de Imágenes
      </h1>
      {loadingBuildingId && (
        <p className="loading-message">Cargando ID del edificio...</p>
      )}
      {errorBuildingId && <p className="error-message">{errorBuildingId}</p>}
      {loadingImages && !errorImages && (
        <p className="loading-message">Cargando imágenes...</p>
      )}
      {errorImages && <p className="error-message">{errorImages}</p>}
      {!loadingBuildingId &&
        !errorBuildingId &&
        !loadingImages &&
        !errorImages &&
        Object.keys(groupedImages).length > 0 ? (
          <Row xs={1} md={2} lg={3} className="g-4 room-cards-grid">
            {Object.entries(groupedImages).map(([roomId, roomData]) => (
              <Col key={roomId}>
                <Card>
                  <Card.Header
                    onClick={() => toggleRoomExpansion(roomId)}
                    style={{ cursor: "pointer" }}
                  >
                    {roomData.images[0]?.imageBase64 && (
                      <div
                        className="card-image-container"
                        style={{
                          backgroundImage: `url(${roomData.images[0].imageBase64})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          height: "150px",
                          marginBottom: "10px",
                        }}
                      ></div>
                    )}
                    <div className="card-info">
                      <Card.Title>{roomData.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        {roomData.images.length} imágenes
                      </Card.Subtitle>
                    </div>
                  </Card.Header>
                  {expandedRoom === roomId && (
                    <Card.Body className={`image-panel expanded`}>
                      <div className="d-flex flex-wrap gap-2">
                        {roomData.images.map((image) => (
                          <Image
                            key={image.id}
                            src={image.imageBase64}
                            alt={image.title || "Imagen"}
                            className="panel-image"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              cursor: "pointer",
                            }}
                            onClick={() => handleImageClick(image)}
                          />
                        ))}
                      </div>
                    </Card.Body>
                  )}
                </Card>
                {roomId === lastRoomId && (
                  <div className="gallery-footer mt-4 text-center">
                    <hr className="footer-line text-align-center" />
                    <h3 className="footer-title">Planos</h3>
                    {loadingPlan && <p className="loading-message">Cargando plano...</p>}
                    {errorPlan && <p className="error-message">{errorPlan}</p>}
                    {buildingPlanUrl ? (
                      <Button variant="outline-primary" onClick={handleShowPlanModal}>
                        Ver Plano del Edificio
                      </Button>
                    ) : (
                      !loadingPlan && !errorPlan && (
                        <p className="no-plan">No hay planos disponibles para este edificio.</p>
                      )
                    )}
                  </div>
                )}
              </Col>
            ))}
          </Row>
        ) : (
          !loadingBuildingId &&
          !errorBuildingId &&
          !loadingImages &&
          !errorImages && (
            <p className="no-images">No hay imágenes para este edificio.</p>
          )
        )}
      {!loadingBuildingId && !errorBuildingId && !buildingIdFromToken && (
        <p className="no-id">ID del edificio no disponible.</p>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Body className="d-flex justify-content-center align-items-center">
          {selectedImage && (
            <Image
              src={selectedImage.imageBase64}
              alt={selectedImage.title || "Imagen grande"}
              fluid
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPlanModal} onHide={handleClosePlanModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Plano del Edificio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {buildingPlanUrl ? (
            <iframe
              src={buildingPlanUrl}
              type="application/pdf"
              width="100%"
              height="500px"
              title="Plano del Edificio"
            />
          ) : (
            <p>No se pudo cargar el plano del edificio.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePlanModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ClientGallery;