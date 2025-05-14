import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { ChevronLeft} from "lucide-react";

function ManualsDoc() {
  const location = useLocation();
  const [buildingId, setBuildingId] = useState("");
  const [pdfDataListWithInfo, setPdfDataListWithInfo] = useState([]);
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
      fetchManuals(buildingId);
    }
  }, [buildingId]);

  const fetchManuals = async (id) => {
    setLoading(true);
    setError(null);
    setPdfDataListWithInfo([]);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró el token de autenticación.");
      setLoading(false);
      return;
    }

    try {
      const responseIds = await fetch(
        `http://localhost:8080/auth/building/${id}/manualIds`,
        {
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
        const responsePdfs = await fetch(`http://localhost:8080/manual/pdfs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(idList),
        });

        if (!responsePdfs.ok) {
          throw new Error(
            `Error al descargar los manuales: ${responsePdfs.status}`
          );
        }

        const pdfDataList = await responsePdfs.json();
        const pdfsWithInfo = pdfDataList.map((pdfData) => {
          const byteString = atob(pdfData.data);
          const byteArray = new Uint8Array(byteString.length);
          for (let i = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
          }
          const fileBlob = new Blob([byteArray], { type: "application/pdf" });
          const url = URL.createObjectURL(fileBlob);
          return { filename: pdfData.filename, url: url };
        });
        setPdfDataListWithInfo(pdfsWithInfo);
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
      pdfDataListWithInfo.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [pdfDataListWithInfo]);

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
          {pdfDataListWithInfo.length > 0 && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre del Archivo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pdfDataListWithInfo.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.filename}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => window.open(item.url, "_blank")}
                      >
                        <i className="bi bi-file-pdf-fill mr-2"></i> Abrir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {!pdfDataListWithInfo.length && !error && !loading && buildingId && (
            <p className="text-center">No hay manuales disponibles para este edificio.</p>
          )}
          {!buildingId && !error && <p className="text-center">Esperando el ID del edificio...</p>}
        </Col>
      </Row>
    </Container>
  );
}

export default ManualsDoc;