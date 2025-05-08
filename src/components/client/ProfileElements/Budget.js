import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './Budget.css';
import { Container, Button, ListGroup } from 'react-bootstrap';

function Budget() {
    const [budgetData, setBudgetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openChapters, setOpenChapters] = useState({});
    const [openItems, setOpenItems] = useState({});
    const [buildingId, setBuildingId] = useState(null);
    const [loadingBuildingId, setLoadingBuildingId] = useState(true);
    const [errorBuildingId, setErrorBuildingId] = useState(null);
    const token = localStorage.getItem('authToken');
    const [showAllChapters, setShowAllChapters] = useState(false);

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setBuildingId(decodedToken.building_id || null);
            } catch (err) {
                setErrorBuildingId('Error al leer la información del edificio del token.');
                console.error("Error al decodificar el token:", err);
            } finally {
                setLoadingBuildingId(false);
            }
        } else {
            setErrorBuildingId('No se encontró el token de autenticación.');
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
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                    });

                    if (!response.ok) {
                        let errorMessage = `Error al cargar el presupuesto: ${response.status}`;
                        try {
                            const errorData = await response.json();
                            errorMessage += ` - ${errorData.message || 'Detalles no disponibles'}`;
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
                    console.error('Error de red al cargar el presupuesto:', error);
                    setError('Error de red al cargar el presupuesto.');
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
        setOpenChapters(prevState => ({
            ...prevState,
            [chapterId]: !prevState[chapterId],
        }));
    };

    const toggleItem = (itemId) => {
        setOpenItems((prevState) => ({
            ...prevState,
            [itemId]: !prevState[itemId],
        }));
    };

    const handleShowAllChapters = () => {
        if (showAllChapters) {
            setOpenChapters({});
            setOpenItems({});
        }
        setShowAllChapters(!showAllChapters);
    };

    if (loadingBuildingId) {
        return <div className="loading">Cargando ID del edificio...</div>;
    }

    if (errorBuildingId) {
        return <div className="error">Error al cargar el ID del edificio: {errorBuildingId}</div>;
    }

    if (loading) {
        return <div className="loading">Cargando presupuesto...</div>;
    }

    if (error) {
        return <div className="error">Error al cargar el presupuesto: {error}</div>;
    }

    if (!budgetData) {
        return <div className="no-data">No se han encontrado datos de presupuesto.</div>;
    }

    let chaptersToDisplay = budgetData.chapters || [];
    const numberOfChapters = chaptersToDisplay.length;
    if (!showAllChapters && numberOfChapters > 10) {
        chaptersToDisplay = chaptersToDisplay.slice(0, 10);
    }

    return (
        <Container className="budget-container">
            <h1 className="budget-title">{budgetData.title}</h1>
            <ListGroup className="chapters-list">
                {Array.isArray(chaptersToDisplay) ? (
                    chaptersToDisplay.map(chapter => {
                        // Calcular el total del capítulo (incluyendo el amount del capítulo si existe)
                        let chapterTotal = parseFloat(chapter.amount || 0); // Inicializar con el amount del capítulo
                        if (chapter.items && Array.isArray(chapter.items)) {
                            chapterTotal += chapter.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
                        }

                        return (
                            <ListGroup.Item key={chapter.id} className="chapter-item">
                                <Button
                                    variant="primary"
                                    onClick={() => toggleChapter(chapter.id)}
                                    className={`chapter-button ${openChapters[chapter.id] ? 'open' : ''}`}
                                    block
                                    aria-expanded={openChapters[chapter.id]}
                                    aria-controls={`chapter-${chapter.id}`}
                                >
                                    {chapter.title} {openChapters[chapter.id] ? '▼' : '▶'}
                                </Button>
                                {openChapters[chapter.id] && (
                                    <ListGroup className="items-list" id={`chapter-${chapter.id}`}>
                                        {chapter.items && Array.isArray(chapter.items) ? (
                                            chapter.items.map(item => (
                                                <ListGroup.Item key={item.id} className="item-item">
                                                    <Button
                                                        variant="light"
                                                        onClick={() => toggleItem(item.id)}
                                                        className={`item-button ${
                                                            openItems[item.id] ? "open" : ""
                                                        } ${item.amount ? "has-details" : ""}`}
                                                        block
                                                        aria-expanded={openItems[item.id]}
                                                        aria-controls={`item-${item.id}`}
                                                    >
                                                        {item.title}
                                                        {item.amount ? (openItems[item.id] ? '▼' : '▶') : ''}
                                                    </Button>
                                                    {openItems[item.id] && item.amount && (
                                                        <div className="item-details" id={`item-${item.id}`}>
                                                            Importe: {item.amount} €
                                                        </div>
                                                    )}
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item className="no-items">No hay partidas para este capítulo.</ListGroup.Item>
                                        )}
                                        {openChapters[chapter.id] && (
                                            <div className="chapter-total">
                                                Total Capítulo: {chapterTotal.toFixed(2)} €
                                            </div>
                                        )}
                                    </ListGroup>
                                )}
                                {!openChapters[chapter.id] && (
                                    <div className="chapter-total-collapsed">
                                        Total Capítulo: {chapterTotal.toFixed(2)} €
                                    </div>
                                )}
                            </ListGroup.Item>
                        );
                    })
                ) : (
                    <ListGroup.Item className="error">Error: Los datos del presupuesto no tienen el formato esperado.</ListGroup.Item>
                )}
            </ListGroup>
            {numberOfChapters > 10 && (
                <Button variant="outline-secondary" className="view-more-button" onClick={handleShowAllChapters}>
                    Ver {showAllChapters ? 'menos' : 'más'} capítulos
                </Button>
            )}
        </Container>
    );
}

export default Budget;