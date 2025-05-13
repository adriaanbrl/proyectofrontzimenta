import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./Budget.css";
import { Container, Button, ListGroup, Card } from "react-bootstrap";
import { ChevronLeft, File } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Budget() {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openChapters, setOpenChapters] = useState({});
  const [buildingId, setBuildingId] = useState(null);
  const [loadingBuildingId, setLoadingBuildingId] = useState(true);
  const [errorBuildingId, setErrorBuildingId] = useState(null);
  const token = localStorage.getItem("authToken");
  const [showAllChapters, setShowAllChapters] = useState(false);
  const navigate = useNavigate();
  const chaptersToShowInitially = 5;

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setBuildingId(decodedToken.building_id || null);
      } catch (err) {
        setErrorBuildingId(
          "Error al leer la información del edificio del token."
        );
        console.error("Error al decodificar el token:", err);
      } finally {
        setLoadingBuildingId(false);
      }
    } else {
      setErrorBuildingId("No se encontró el token de autenticación.");
      setLoadingBuildingId(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchBudget = async () => {
      if (buildingId) {
        setLoading(true);
        setError(null);
        const url = `http://localhost:8080/api/budget/${buildingId}/budget`;

        try {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Requested-With": "XMLHttpRequest",
            },
          });

          if (!response.ok) {
            let errorMessage = `Error al cargar el presupuesto: ${response.status}`;
            try {
              const errorData = await response.json();
              errorMessage += ` - ${
                errorData.message || "Detalles no disponibles"
              }`;
            } catch (e) {
              errorMessage = `Error al cargar el presupuesto: ${response.status}`;
            }
            console.error(errorMessage);
            setError(errorMessage);
          } else {
            const data = await response.json();
            console.log("Datos recibidos de la API:", data);
            setBudgetData(data);
          }
        } catch (error) {
          console.error("Error de red al cargar el presupuesto:", error);
          setError("Error de red al cargar el presupuesto.");
        } finally {
          setLoading(false);
        }
      }
    };

    if (!loadingBuildingId && buildingId) {
      fetchBudget();
    }
  }, [buildingId, token, loadingBuildingId]);

  const toggleChapter = (chapterId) => {
    setOpenChapters((prevState) => ({
      ...prevState,
      [chapterId]: !prevState[chapterId],
    }));
  };

  const handleShowAllChapters = () => {
    if (showAllChapters) {
      setOpenChapters({});
    }
    setShowAllChapters(!showAllChapters);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loadingBuildingId) {
    return <div className="loading">Cargando ID del edificio...</div>;
  }

  if (errorBuildingId) {
    return (
      <div className="error">
        Error al cargar el ID del edificio: {errorBuildingId}
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Cargando presupuesto...</div>;
  }

  if (error) {
    return <div className="error">Error al cargar el presupuesto: {error}</div>;
  }

  if (!budgetData) {
    return (
      <div className="no-data">No se han encontrado datos de presupuesto.</div>
    );
  }

  let chaptersToDisplay = budgetData.chapters || [];
  const numberOfChapters = chaptersToDisplay.length;
  if (!showAllChapters && numberOfChapters > chaptersToShowInitially) {
    chaptersToDisplay = chaptersToDisplay.slice(0, chaptersToShowInitially);
  }

  return (
    <Container className="budget-container">
      <div className="budget-header">
        <Button
          variant="link"
          onClick={handleGoBack}
          className="back-button"
          aria-label="Volver atrás"
        >
          <ChevronLeft size={20} color="orange" />
        </Button>
        <h1 className="budget-title fw-bold">{budgetData.title}</h1>
      </div>

      <ListGroup className="chapters-list">
        {Array.isArray(chaptersToDisplay) ? (
          chaptersToDisplay.map((chapter) => {
            let chapterTotal = 0;
            if (chapter.items && Array.isArray(chapter.items) && chapter.items.length > 0) {
              chapterTotal = chapter.items.reduce(
                (sum, item) => sum + parseFloat(item.amount || 0),
                0
              );
            } else {
              chapterTotal = parseFloat(chapter.amount || 0);
            }

            return (
              <Card key={chapter.id} className="chapter-card">
                <Card.Header className="chapter-header">
                  <Button
                    variant="btn-outline-custom"
                    onClick={() => toggleChapter(chapter.id)}
                    className={`chapter-button ${
                      openChapters[chapter.id] ? "open" : ""
                    }`}
                    aria-expanded={openChapters[chapter.id]}
                    aria-controls={`chapter-${chapter.id}`}
                  >
                    {chapter.title}{" "}
                  </Button>
                  <div className="chapter-total-header fw-bold ms-2">
                    Total:{" "}
                    {chapterTotal.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €
                  </div>
                </Card.Header>
                {openChapters[chapter.id] && (
                  <Card.Body
                    className="chapter-body"
                    id={`chapter-${chapter.id}`}
                  >
                    <ListGroup className="items-list">
                      {chapter.items && Array.isArray(chapter.items) ? (
                        chapter.items.map((item) => (
                          <ListGroup.Item key={item.id} className="item-item">
                            <div className="item-header">
                              <span className="item-title">{item.title}</span>
                              {item.amount && (
                                <span className="item-amount fw-bold">
                                  {parseFloat(item.amount).toLocaleString(
                                    "es-ES",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}{" "}
                                  €
                                </span>
                              )}
                            </div>
                            {/* Eliminamos la sección de detalles del item */}
                          </ListGroup.Item>
                        ))
                      ) : (
                        <ListGroup.Item className="no-items">
                          No hay partidas para este capítulo.
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                    <div className="chapter-total-body fw-bold">
                      Importe del capítulo:{" "}
                      {chapterTotal.toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      €
                    </div>
                  </Card.Body>
                )}
              </Card>
            );
          })
        ) : (
          <ListGroup.Item>
            Error: Los datos del presupuesto no tienen el formato esperado.
          </ListGroup.Item>
        )}
      </ListGroup>

      {numberOfChapters > chaptersToShowInitially && (
        <Button
          variant="btn-outline-custom"
          className="btn-outline-custom"
          onClick={handleShowAllChapters}
        >
          Ver{" "}
          {showAllChapters
            ? "menos capítulos"
            : `${numberOfChapters - chaptersToShowInitially} capítulos más`}
        </Button>
      )}
    </Container>
  );
}

export default Budget;
