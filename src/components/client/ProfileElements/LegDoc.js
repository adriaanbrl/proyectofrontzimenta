import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  ListGroup,
  Spinner
} from "react-bootstrap";
import { ChevronLeft, File } from "lucide-react";

function LegDoc() {
  const location = useLocation();
  const navigate = useNavigate();
  const [buildingId, setBuildingId] = useState(null);
  const [pdfDataList, setPdfDataList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Documentación Legal";

    if (location.state && location.state.building_id) {
      setBuildingId(location.state.building_id);
    } else {
      setError("No se proporcionó el ID del edificio. Volviendo a la página anterior...");
      // navigate(-1); // Consider uncommenting this if you want to automatically go back
    }
  }, [location.state, navigate]);

  // Make sure `fetchLegalDocuments` depends on `buildingId`
  const fetchLegalDocuments = useCallback(async (id) => {
    // This `id` parameter should be the `buildingId`
    if (!id) { // Add a check to ensure `id` is not null/undefined
      console.log("Building ID is not available yet for fetching documents.");
      setLoading(false); // Ensure loading is off if no ID
      return;
    }

    setLoading(true);
    setError(null);
    setPdfDataList([]);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró el token de autenticación. Por favor, inicie sesión de nuevo.");
      setLoading(false);
      return;
    }

    try {
      const responseDocs = await fetch(
          `http://localhost:8080/api/building/${id}/legal_documentation`, // Ensure 'id' here is a number
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (!responseDocs.ok) {
        const errorData = await responseDocs.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(
            `Error al obtener la lista de documentos: ${responseDocs.status} - ${errorData.message || responseDocs.statusText}`
        );
      }

      const documentInfoList = await responseDocs.json();

      if (Array.isArray(documentInfoList) && documentInfoList.length > 0) {
        // Here, we create the URLs directly because the backend serves the PDF via GET /api/legal_documentation/pdf/{id}
        const pdfsReadyForDisplay = documentInfoList.map(doc => ({
          filename: doc.title,
          url: `http://localhost:8080/api/legal_documentation/pdf/${doc.id}` // Use doc.id from the fetched list
        }));
        setPdfDataList(pdfsReadyForDisplay);
        setError(null);
      } else if (Array.isArray(documentInfoList) && documentInfoList.length === 0) {
        setError("No hay documentos legales disponibles para este edificio.");
      } else {
        setError(
            "Respuesta inesperada del servidor al obtener documentos: Se esperaba una lista."
        );
      }
    } catch (err) {
      console.error("Error en fetchLegalDocuments:", err);
      setError(`Fallo al cargar documentos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []); // The `id` parameter here makes `useCallback` linting happy, but the actual `buildingId` is passed below.

  // This useEffect ensures fetchLegalDocuments is called when buildingId changes
  useEffect(() => {
    if (buildingId) { // Only call if buildingId is not null
      fetchLegalDocuments(buildingId); // Pass the actual buildingId from state
    }
  }, [buildingId, fetchLegalDocuments]); // Depend on buildingId and fetchLegalDocuments

  // We are now using direct PDF URLs, so revokeObjectURL is NOT needed.
  // The backend sends the actual PDF content, not a Base64 string to be converted to Blob.
  // The `window.open` will simply navigate to the PDF URL.
  /*
  useEffect(() => {
    return () => {
      pdfDataList.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [pdfDataList]);
  */

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
      <Container className="py-4">
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
              <h2 className="leg-doc-title mb-0">Documentación Legal</h2>
            </div>

            {loading && (
                <div className="d-flex justify-content-center my-4">
                  <Spinner animation="border" role="status" className="text-primary">
                    <span className="visually-hidden">Cargando documentos...</span>
                  </Spinner>
                  <p className="ms-2 text-muted">Cargando documentos...</p>
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && pdfDataList.length > 0 && (
                <ListGroup>
                  {pdfDataList.map((item, index) => (
                      <ListGroup.Item
                          key={item.url || index} // Use item.url as key (unique for each PDF URL)
                          className="d-flex justify-content-between align-items-center"
                      >
                        <div className="d-flex align-items-center">
                          <File
                              size={24}
                              className="me-3"
                              style={{ color: "orange" }}
                          />
                          <span>{item.filename}</span>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => window.open(item.url, "_blank")}
                            className="ms-4"
                        >
                          Ver Documento
                        </Button>
                      </ListGroup.Item>
                  ))}
                </ListGroup>
            )}

            {!loading && pdfDataList.length === 0 && !error && buildingId && (
                <Alert variant="info" className="text-center">
                  No hay documentos legales disponibles para este edificio.
                </Alert>
            )}

            {!buildingId && !error && !loading && (
                <Alert variant="info" className="text-center">
                  Esperando el ID del edificio para cargar los documentos...
                </Alert>
            )}
          </Col>
        </Row>
      </Container>
  );
}

export default LegDoc;