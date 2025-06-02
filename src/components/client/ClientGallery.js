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

// Importa una imagen predefinida para los planos.
// IMPORTANTE: Para que './planos.jpg' funcione, 'planos.jpg' DEBE estar en el
// MISMO DIRECTORIO que este archivo ClientGallery.jsx.
import planPlaceholderImage from "./planos.jpg";


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
  const [loadingPlan, setLoadingPlan] = useState(true); // Se mantiene true para la carga inicial
  const [errorPlan, setErrorPlan] = useState(null);
  // const [showPlanModal, setShowPlanModal] = useState(false); // Este estado no se usa en el código proporcionado, lo mantengo comentado.

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
            acc[roomId].images.push(image); // Asume que 'image' ahora contiene 'imageBase64' sin prefijo
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
    const fetchBuildingPlanUrl = async () => {
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
            setBuildingPlanUrl(url); // Si hay plano, guarda la URL
          } else if (response.status === 404) {
            setBuildingPlanUrl(null); // Si no hay plano (404), establece a null
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error(
              `Error fetching URL del plano del edificio ${buildingIdFromToken}:`,
              error
          );
          setErrorPlan("Error al obtener la URL del plano.");
          setBuildingPlanUrl(null); // Si hay otro error, también establece a null
        } finally {
          setLoadingPlan(false);
        }
      }
    };

    fetchBuildingPlanUrl();
  }, [buildingIdFromToken]); // Dependencia: buildingIdFromToken

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

  const handlePlanClick = async () => {
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
          const pdfUrl = urlCreator.createObjectURL(blob);
          window.open(pdfUrl, "_blank");
        } else if (response.status === 403) {
          setErrorPlan("No tienes permiso para ver este plano.");
        } else if (response.status === 404) {
          setErrorPlan("El plano del edificio no se encontró.");
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

  // lastRoomId no se usa directamente en el renderizado condicional de la card del plano,
  // pero se mantiene si se usa en otras partes de tu lógica.
  // const lastRoomId = Object.keys(groupedImages)[Object.keys(groupedImages).length - 1];

  return (
      <Container className="p-3">
        <div className="header-section d-flex align-items-center justify-content-center mb-4">
          <h1 className="  flex-grow-1 text-title text-center mb-5 fw-bold fs-2 mt-5">
            Galería de Imágenes
          </h1>
        </div>
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
                                  // AÑADIDO EL PREFIJO data:image/jpeg;base64,
                                  backgroundImage: `url(data:image/jpeg;base64,${roomData.images[0].imageBase64})`,
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
                                      // AÑADIDO EL PREFIJO data:image/jpeg;base64,
                                      src={`data:image/jpeg;base64,${image.imageBase64}`}
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
                  </Col>
              ))}

              {/* Building Plan Card - Condicionalmente renderizado */}
              {(!loadingPlan && buildingPlanUrl) && ( // Solo muestra la card si NO está cargando Y hay una URL de plano
                  <Col>
                    <Card
                        className="h-100 shadow-sm image-card"
                        style={{ cursor: "pointer" }}
                        onClick={handlePlanClick}
                    >
                      <Card.Img
                          variant="top"
                          src={planPlaceholderImage}
                          style={{ height: "180px", objectFit: "cover" }}
                      />
                      <Card.Body className="text-center py-2">
                        <Card.Title className="mb-0 small">Ver Plano del Edificio</Card.Title>
                        {loadingPlan && (
                            <Card.Text className="text-muted">Cargando...</Card.Text>
                        )}
                        {errorPlan && (
                            <Card.Text className="text-danger">{errorPlan}</Card.Text>
                        )}
                        {/* Este else ya no es necesario si la card entera se oculta */}
                      </Card.Body>
                    </Card>
                  </Col>
              )}
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
                    // AÑADIDO EL PREFIJO data:image/jpeg;base64,
                    src={`data:image/jpeg;base64,${selectedImage.imageBase64}`}
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
      </Container>
  );
}

export default ClientGallery;