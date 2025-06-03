import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  ListGroup,
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
    }
  }, [location.state, navigate]);

  const fetchLegalDocuments = useCallback(async (id) => {
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
      const responseIds = await fetch(
          `http://localhost:8080/auth/building/${id}/legalDocumentsIds`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (!responseIds.ok) {
        const errorData = await responseIds.json().catch(() => ({ message: "Error desconocido" }));
        throw new Error(
            `Error al obtener la lista de documentos: ${responseIds.status} - ${errorData.message || responseIds.statusText}`
        );
      }

      const idList = await responseIds.json();

      if (Array.isArray(idList) && idList.length > 0) {
        const responsePdfs = await fetch(
            `http://localhost:8080/legaldocuments/pdfs`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(idList),
            }
        );

        if (!responsePdfs.ok) {
          const errorData = await responsePdfs.json().catch(() => ({ message: "Error desconocido" }));
          throw new Error(
              `Error al descargar los documentos: ${responsePdfs.status} - ${errorData.message || responsePdfs.statusText}`
          );
        }

        const pdfDataListFromServer = await responsePdfs.json();

        const pdfsWithInfo = pdfDataListFromServer.map((pdfData) => {
          if (!pdfData.data || !pdfData.filename) {
            console.warn("Datos de PDF incompletos recibidos:", pdfData);
            return null;
          }
          try {
            const byteString = atob(pdfData.data);
            const byteArray = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
              byteArray[i] = byteString.charCodeAt(i);
            }
            const fileBlob = new Blob([byteArray], { type: "application/pdf" });
            const url = URL.createObjectURL(fileBlob);
            return { filename: pdfData.filename, url: url };
          } catch (e) {
            console.error("Error al decodificar o crear Blob para:", pdfData.filename, e);
            return null;
          }
        }).filter(Boolean);

        setPdfDataList(pdfsWithInfo);
      } else if (Array.isArray(idList) && idList.length === 0) {
        setError("No hay documentos legales disponibles para este edificio.");
      } else {
        setError(
            "Respuesta inesperada del servidor al obtener IDs: Se esperaba una lista."
        );
      }
    } catch (err) {
      console.error("Error en fetchLegalDocuments:", err);
      setError(`Fallo al cargar documentos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (buildingId) {
      fetchLegalDocuments(buildingId);
    }
  }, [buildingId, fetchLegalDocuments]);

  useEffect(() => {
    return () => {
      pdfDataList.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [pdfDataList]);

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
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando documentos...</span>
                  </div>
                  <p className="ms-2 text-muted">Cargando documentos...</p>
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && pdfDataList.length > 0 && (
                <ListGroup>
                  {pdfDataList.map((item, index) => (
                      <ListGroup.Item
                          key={index}
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