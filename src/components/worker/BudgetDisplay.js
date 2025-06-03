import React, { useState, useEffect } from "react";
import { Container, Button, ListGroup, Card } from "react-bootstrap";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Modified to accept buildingId as a prop
function BudgetDisplay({ buildingId }) {
    const [budgetData, setBudgetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openChapters, setOpenChapters] = useState({});
    const token = localStorage.getItem("authToken");
    const [showAllChapters, setShowAllChapters] = useState(false);
    const navigate = useNavigate();
    const chaptersToShowInitially = 5;

    // Removed the useEffect for decoding buildingId from token,
    // as buildingId is now passed as a prop.

    useEffect(() => {
        const fetchBudget = async () => {
            if (buildingId) { // Use the buildingId prop directly
                setLoading(true);
                setError(null);
                // CORRECTED URL: Changed from /api/budget/building/${buildingId} to /api/budget/${buildingId}/budget
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
                            errorMessage = `Error al cargar el presupuesto: ${response.status} ${response.statusText}`;
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
            } else {
                // If buildingId is not provided, set loading to false and clear data/error
                setLoading(false);
                setBudgetData(null);
                setError("No se proporcionó un ID de edificio para cargar el presupuesto.");
            }
        };

        // Fetch budget whenever buildingId or token changes
        fetchBudget();
    }, [buildingId, token]); // Dependencies updated

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

    // Removed loadingBuildingId and errorBuildingId checks
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
            <div className="budget-header d-flex align-items-center justify-content-between">
                <Button
                    variant="link"
                    onClick={handleGoBack}
                    className="back-button"
                    aria-label="Volver atrás"
                >
                    <ChevronLeft size={20} color="orange" />
                </Button>
                <h1 className="budget-title fw-bold text-center m-0">Presupuesto</h1>
                <div style={{ visibility: "hidden" }}>
                    <ChevronLeft size={20} color="orange" />
                </div>
            </div>

            {budgetData.title && (
                <h2 className="text-center mt-3 mb-4">
                    {budgetData.title}
                    {budgetData.amount && (
                        <span className="ms-3">
              Total:{" "}
                            {parseFloat(budgetData.amount).toLocaleString("es-ES", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}{" "}
                            €
            </span>
                    )}
                </h2>
            )}

            <ListGroup className="chapters-list">
                {Array.isArray(chaptersToDisplay) && chaptersToDisplay.length > 0 ? (
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
                                        {chapter.chapterCode ? `${chapter.chapterCode} - ` : ''}{chapter.title}{" "}
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
                                            {chapter.items && Array.isArray(chapter.items) && chapter.items.length > 0 ? (
                                                chapter.items.map((item) => (
                                                    <ListGroup.Item key={item.id} className="item-item">
                                                        <div className="item-header">
                                          <span className="item-title">
                                            {item.itemCode ? `${item.itemCode} - ` : ''}{item.title}
                                          </span>
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
                                                    </ListGroup.Item>
                                                ))
                                            ) : (
                                                <ListGroup.Item className="no-items">
                                                    No hay partidas para este capítulo.
                                                </ListGroup.Item>
                                            )}
                                        </ListGroup>
                                        <div className="chapter-total-body fw-bold mt-3">
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
                        {Array.isArray(chaptersToDisplay) && chaptersToDisplay.length === 0
                            ? "No hay capítulos disponibles para este presupuesto."
                            : "Error: Los datos del presupuesto no tienen el formato esperado."}
                    </ListGroup.Item>
                )}
            </ListGroup>

            {numberOfChapters > chaptersToShowInitially && (
                <Button
                    variant="btn-outline-custom"
                    className="btn-outline-custom mt-3 w-100"
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

export default BudgetDisplay;
