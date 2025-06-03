import React, { useState, useEffect } from "react";
import { Container, Button, ListGroup, Card, Spinner, Alert } from "react-bootstrap"; // Added Spinner and Alert
// Removed import for ChevronLeft as the back button is being removed
import { useNavigate } from "react-router-dom";

function BudgetDisplay({ buildingId }) {
    const [budgetData, setBudgetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openChapters, setOpenChapters] = useState({});
    const token = localStorage.getItem("authToken");
    const [showAllChapters, setShowAllChapters] = useState(false);
    const navigate = useNavigate(); // Still keep navigate for potential future use or if other logic uses it
    const chaptersToShowInitially = 5;

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
                setLoading(false);
                setBudgetData(null);
                setError("No se proporcionó un ID de edificio para cargar el presupuesto.");
            }
        };

        fetchBudget();
    }, [buildingId, token]);

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

    // Removed handleGoBack function as the back button is removed

    if (loading) {
        return <div className="text-center my-3"><Spinner animation="border" size="sm" /> Cargando presupuesto...</div>;
    }

    if (error) {
        return <Alert variant="danger" className="mt-3">Error al cargar el presupuesto: {error}</Alert>;
    }

    if (!budgetData) {
        return (
            <Alert variant="info" className="mt-3">No se han encontrado datos de presupuesto para esta construcción.</Alert>
        );
    }

    let chaptersToDisplay = budgetData.chapters || [];

    const numberOfChapters = chaptersToDisplay.length;
    if (!showAllChapters && numberOfChapters > chaptersToShowInitially) {
        chaptersToDisplay = chaptersToDisplay.slice(0, chaptersToShowInitially);
    }

    return (
        <Container className="budget-container">
            {/* Removed the entire budget-header div which contained the top "Presupuesto" title and back button */}

            {budgetData.title && (
                // Changed h2 to h6 for a smaller title
                <h6 className="text-center mt-3 mb-4 text-muted">
                    {budgetData.title}
                    {budgetData.amount && (
                        <span className="ms-2">
              Total:{" "}
                            {parseFloat(budgetData.amount).toLocaleString("es-ES", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}{" "}
                            €
            </span>
                    )}
                </h6>
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
                            <Card key={chapter.id} className="chapter-card mb-2 shadow-sm">
                                <Card.Header className="chapter-header d-flex justify-content-between align-items-center py-2">
                                    <Button
                                        variant="link" // Changed to link for a more subtle look, less prominent
                                        onClick={() => toggleChapter(chapter.id)}
                                        className={`chapter-button p-0 text-decoration-none ${
                                            openChapters[chapter.id] ? "open" : ""
                                        }`}
                                        aria-expanded={openChapters[chapter.id]}
                                        aria-controls={`chapter-${chapter.id}`}
                                    >
                                        <strong>{chapter.chapterCode ? `${chapter.chapterCode} - ` : ''}{chapter.title}</strong>
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
                                        className="chapter-body p-2"
                                        id={`chapter-${chapter.id}`}
                                    >
                                        <ListGroup className="items-list">
                                            {chapter.items && Array.isArray(chapter.items) && chapter.items.length > 0 ? (
                                                chapter.items.map((item) => (
                                                    <ListGroup.Item key={item.id} className="item-item d-flex justify-content-between align-items-center py-1 px-2 border-0">
                                                        <div className="item-header">
                                          <span className="item-title text-muted small">
                                            {item.itemCode ? `${item.itemCode} - ` : ''}{item.title}
                                          </span>
                                                        </div>
                                                        {item.amount && (
                                                            <span className="item-amount fw-bold ms-auto small">
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
                                                    </ListGroup.Item>
                                                ))
                                            ) : (
                                                <ListGroup.Item className="no-items text-muted small border-0">
                                                    No hay partidas para este capítulo.
                                                </ListGroup.Item>
                                            )}
                                        </ListGroup>
                                        <div className="chapter-total-body fw-bold mt-2 text-end border-top pt-2">
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
                    <Alert variant="info" className="mt-3">
                        {Array.isArray(chaptersToDisplay) && chaptersToDisplay.length === 0
                            ? "No hay capítulos disponibles para este presupuesto."
                            : "Error: Los datos del presupuesto no tienen el formato esperado."}
                    </Alert>
                )}
            </ListGroup>

            {numberOfChapters > chaptersToShowInitially && (
                <Button
                    variant="outline-secondary" // Changed variant for a more subtle button
                    className="mt-3 w-100"
                    onClick={handleShowAllChapters}
                    size="sm" // Make the button smaller
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
