import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { ChevronLeft, File } from "lucide-react";

function ManualsDoc() {
  const location = useLocation();
  const [buildingId, setBuildingId] = useState("");
  const [zipUrl, setZipUrl] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Manuales de Usuario";
    if (location.state && location.state.building_id) {
      setBuildingId(location.state.building_id);
    } else {
      setError("No se proporcionó el ID del edificio.");
    }
  }, [location.state]);

  useEffect(() => {
    if (buildingId) {
      fetchManualsZip(buildingId);
    }
  }, [buildingId]);

  const fetchManualsZip = async (id) => {
    setLoading(true);
    setError(null);
    setZipUrl(null);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/auth/building/${id}/manual/zip`,
        {
          method: "GET", // Asegúrate de que el método sea GET
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Añade explícitamente el Content-Type
          },
        }
      );

      if (!response.ok) {
        // Intenta leer el cuerpo de la respuesta para obtener más información sobre el error
        let errorMessage = `Error al obtener el archivo ZIP: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`; // Añade detalles del error del servidor
        } catch (jsonError) {
          // Si falla al parsear el JSON, solo usa el mensaje de estado
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setZipUrl(url);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (zipUrl) {
        URL.revokeObjectURL(zipUrl);
      }
    };
  }, [zipUrl]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="leg-doc-container">
      <Row>
        <Col>
          <div className="d-flex justify-content-center align-items-center mb-4">
            <Button
              variant="link"
              onClick={handleGoBack}
              className="back-button me-3"
              aria-label="Volver atrás"
              style={{ padding: 0 }}
            >
              <ChevronLeft size={20} color="orange" />
            </Button>
            <h1 className="leg-doc-title text-center mb-0">Manual de Usuario</h1>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading && !error && (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" size="sm" />
              <span className="visually-hidden">Cargando manuales...</span>
            </div>
          )}
          {!loading && !error && zipUrl && (
            <div
              className="d-flex flex-column align-items-center justify-content-center"
              style={{ minHeight: 200 }}
            >
              <a
                href={zipUrl}
                download="manuales_usuario.zip"
                style={{ textDecoration: "none" }}
              >
                <Button variant="link" size="lg" className="text-center">
                  <File size={100} color="#0078d7" />
                  <p className="mt-2 text-primary">Descargar Manuales (ZIP)</p>
                </Button>
              </a>
            </div>
          )}
          {!loading && !error && !zipUrl && (
            <p className="text-center">
              No hay manuales disponibles para este edificio.
            </p>
          )}
          {!buildingId && !error && (
            <p className="text-center">Esperando el ID del edificio...</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ManualsDoc;
