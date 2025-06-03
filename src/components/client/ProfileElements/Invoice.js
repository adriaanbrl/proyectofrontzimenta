import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import { ChevronLeft, File } from "lucide-react";
import { jwtDecode } from "jwt-decode"; 
import axios from "axios"; 

function InvoicesDoc() {
  const location = useLocation();
  const navigate = useNavigate();
  const [buildingId, setBuildingId] = useState(0); 
  const [pdfDataListWithInfo, setPdfDataListWithInfo] = useState([]);
  const [error, setError] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false); 
  const [initialLoading, setInitialLoading] = useState(true);


  
  const fetchInvoices = useCallback(async (id) => {
    setLoadingInvoices(true);
    setError(null);
    setPdfDataListWithInfo([]);

    const token = localStorage.getItem("authToken");

    if (!token) {
      setError("No se encontró el token de autenticación para facturas.");
      setLoadingInvoices(false);
      return;
    }

    try {
      const responseIds = await axios.get(
          `http://localhost:8080/auth/building/${id}/invoicesIds`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      );

      if (responseIds.status !== 200) {
        throw new Error(
            `Error al obtener la lista de facturas: ${responseIds.status}`
        );
      }

      const idList = responseIds.data;

      if (Array.isArray(idList) && idList.length > 0) {
        const responsePdfs = await axios.post(
            `http://localhost:8080/invoices/pdfs`,
            idList,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
        );

        if (responsePdfs.status !== 200) {
          throw new Error(
              `Error al descargar las facturas: ${responsePdfs.status}`
          );
        }

        const pdfDataList = responsePdfs.data;

        const pdfsWithInfo = pdfDataList.map((pdfData) => {
          if (typeof pdfData.data !== 'string' || !pdfData.data) {
            return {
              filename: pdfData.filename || 'Archivo desconocido',
              title: pdfData.title || 'Título no disponible', 
              url: null,
              dateInfo: pdfData.dateInfo || 'Fecha desconocida',
              error: 'Datos PDF no válidos'
            };
          }

          try {
            const byteString = atob(pdfData.data);
            const byteArray = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
              byteArray[i] = byteString.charCodeAt(i);
            }
            const fileBlob = new Blob([byteArray], { type: "application/pdf" });
            const url = URL.createObjectURL(fileBlob);
            return {
              filename: pdfData.filename,
              title: pdfData.title || pdfData.filename, 
              url: url,
              dateInfo: pdfData.dateInfo,
            };
          } catch (e) {
            return {
              filename: pdfData.filename || 'Archivo desconocido',
              title: pdfData.title || 'Título no disponible', 
              url: null,
              dateInfo: pdfData.dateInfo || 'Fecha desconocida',
              error: 'Error al decodificar PDF'
            };
          }
        }).filter(item => item.url !== null);

        setPdfDataListWithInfo(pdfsWithInfo);
      } else if (Array.isArray(idList) && idList.length === 0) {
        setError("No hay facturas disponibles para este edificio.");
      } else {
        setError(
            "Respuesta inesperada del servidor: Se esperaba una lista de IDs."
        );
      }
    } catch (err) {
      setError(`Error al cargar facturas: ${err.message}`);
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  useEffect(() => {
    const getBuildingIdFromToken = async () => {
      setInitialLoading(true);
      setError(null);
      document.title = "Facturas"; 
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          if (location.state && location.state.building_id) {
            setBuildingId(Number(location.state.building_id)); 
          } else {
            throw new Error("No se encontró el token de autenticación ni el ID del edificio en la navegación.");
          }
        } else {
          const decodedToken = jwtDecode(token);
          const id = decodedToken.building_id; 
          if (id) {
            setBuildingId(Number(id)); 
          } else {
            throw new Error("No se encontró 'building_id' en el token de autenticación.");
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    getBuildingIdFromToken();
  }, [location.state]); 

 
  useEffect(() => {
    if (buildingId > 0) { 

      fetchInvoices(buildingId);
    }
  }, [buildingId, fetchInvoices]); 

  
  useEffect(() => {
    return () => {
      pdfDataListWithInfo.forEach((item) => {
        if (item.url) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [pdfDataListWithInfo]);

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
              <h2 className="mb-0 text-center">
                Facturas 
              </h2>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {(initialLoading || loadingInvoices) && ( 
                <div className="d-flex justify-content-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </Spinner>
                </div>
            )}
            {!initialLoading && !loadingInvoices && pdfDataListWithInfo.length > 0 && ( 
                <ListGroup>
                  {pdfDataListWithInfo.map((item, index) => (
                      <ListGroup.Item
                          key={index}
                          className="d-flex justify-content-between align-items-center border rounded mb-2"
                      >
                        <div className="d-flex align-items-center">
                          <File size={24} className="me-3 text-custom" />
                          <span>
                 
                            {item.title || item.filename} ({item.dateInfo})
                    </span>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              if (item.url) {
                                window.open(item.url, "_blank");
                              } else {
                 
                                alert('No se pudo abrir el documento. Datos no válidos.');
                              }
                            }}
                            className="ms-2"
                        >
                          Ver Factura
                        </Button>
                      </ListGroup.Item>
                  ))}
                </ListGroup>
            )}
            {!initialLoading && !loadingInvoices && !pdfDataListWithInfo.length && !error && buildingId > 0 && ( 
                <p className="text-muted text-center">
                  No hay facturas disponibles para este edificio.
                </p>
            )}
            {!initialLoading && !buildingId && !error && (
                <p className="text-muted text-center">
                  No se pudo obtener el ID del edificio.
                </p>
            )}
          </Col>
        </Row>
      </Container>
  );
}

export default InvoicesDoc;
