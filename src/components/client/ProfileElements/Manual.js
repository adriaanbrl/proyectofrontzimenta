import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Card,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import { ChevronLeft, File } from "lucide-react";

function ManualsDoc() {
  const location = useLocation();
  const navigate = useNavigate();
  const [buildingId, setBuildingId] = useState("");
  const [pdfDataList, setPdfDataList] = useState([]);
  const [error, setError] = useState(null);
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
      fetchManuals(buildingId);
    }
  }, [buildingId]);

  const fetchManuals = async (id) => {
    setLoading(true);
    setError(null);
    setPdfDataList([]);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    try {
      const responseIds = await fetch(
          `http://localhost:8080/auth/building/${id}/manualsIds`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (!responseIds.ok) {
        throw new Error(
            `Error al obtener la lista de manuales: ${responseIds.status}`
        );
      }

      const idList = await responseIds.json();

      if (Array.isArray(idList) && idList.length > 0) {
        const responsePdfs = await fetch(
            `http://localhost:8080/manuals/pdfs`,
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
          throw new Error(
              `Error al descargar los manuales: ${responsePdfs.status}`
          );
        }

        const pdfDataListFromServer = await responsePdfs.json();
        const pdfsWithInfo = pdfDataListFromServer.map((pdfData) => {
          const byteString = atob(pdfData.data);
          const byteArray = new Uint8Array(byteString.length);
          for (let i = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
          }
          const fileBlob = new Blob([byteArray], { type: "application/pdf" });
          const url = URL.createObjectURL(fileBlob);
          return { filename: pdfData.filename, url: url };
        });
        setPdfDataList(pdfsWithInfo);
        setLoading(false);
      } else if (Array.isArray(idList) && idList.length === 0) {
        setError("No hay manuales disponibles para este edificio.");
        setLoading(false);
      } else {
        setError(
            "Respuesta inesperada del servidor: Se esperaba una lista de IDs."
        );
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      pdfDataList.forEach((item) => URL.revokeObjectURL(item.url));
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
              <h2 className="leg-doc-title mb-0">Manuales de Usuario</h2>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading && (
                <div className="d-flex justify-content-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </Spinner>
                </div>
            )}
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
                          />{" "}
                          <span>{item.filename}</span>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => window.open(item.url, "_blank")}
                            className="ms-4"
                        >
                          Ver Manual
                        </Button>
                      </ListGroup.Item>
                  ))}
                </ListGroup>
            )}
            {!loading && !pdfDataList.length && !error && buildingId && (
                <p className="text-muted text-center">
                  No hay manuales disponibles para este edificio.
                </p>
            )}
            {!buildingId && !error && (
                <p className="text-muted text-center">Esperando el ID del edificio...</p>
            )}
          </Col>
        </Row>
      </Container>
  );
}

export default ManualsDoc;