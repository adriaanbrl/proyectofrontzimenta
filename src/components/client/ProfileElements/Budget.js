import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './Budget.css';

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
        if (openChapters[chapterId]) {
            const updatedItems = { ...openItems };
            budgetData?.chapters?.forEach(chapter => {
                if (chapter.id === chapterId) {
                    chapter.items?.forEach(item => {
                        delete updatedItems[item.id];
                    });
                }
            });
            setOpenItems(updatedItems);
        }
    };

    const toggleItem = (itemId) => {
        setOpenItems(prevState => ({
            ...prevState,
            [itemId]: !prevState[itemId],
        }));
    };

    const handleShowAllChapters = () => {
        if (showAllChapters) {
            setOpenChapters({}); // Colapsar todos los capítulos
            setOpenItems({});    // Colapsar todos los items
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
        chaptersToDisplay = chaptersToDisplay.slice(0, 10); // Muestra los primeros 10
    }

    return (
        <div className="budget-container">
            <h1 className="budget-title">{budgetData.title}</h1>
            <ul className="chapters-list">
                {Array.isArray(chaptersToDisplay) ? (
                    chaptersToDisplay.map(chapter => (
                        <li key={chapter.id} className="chapter-item">
                            <button
                                onClick={() => toggleChapter(chapter.id)}
                                className={`chapter-button ${openChapters[chapter.id] ? 'open' : ''}`}
                            >
                                {chapter.title} {openChapters[chapter.id] ? '▼' : '▶'}
                            </button>
                            {openChapters[chapter.id] && (
                                <ul className="items-list">
                                    {chapter.items && Array.isArray(chapter.items) ? (
                                        chapter.items.map(item => (
                                            <li key={item.id} className="item-item">
                                                <button
                                                    onClick={() => {
                                                        if (item.amount) {
                                                            toggleItem(item.id);
                                                        }
                                                    }}
                                                    className={`item-button ${openItems[item.id] ? 'open' : ''} ${item.amount ? 'has-details' : ''}`}
                                                >
                                                    {item.description}
                                                    {item.amount ? (openItems[item.id] ? '▼' : '▶') : ''}
                                                </button>
                                                {openItems[item.id] && item.amount && (
                                                    <div className="item-details">
                                                        Importe: {item.amount} €
                                                    </div>
                                                )}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="no-items">No hay partidas para este capítulo.</li>
                                    )}
                                </ul>
                            )}
                        </li>
                    ))
                ) : (
                    <li className="error">Error: Los datos del presupuesto no tienen el formato esperado.</li>
                )}
            </ul>
            {numberOfChapters > 10 && (
                <button className="view-more-button" onClick={handleShowAllChapters}>
                    Ver {showAllChapters ? 'menos' : 'más'} capítulos
                </button>
            )}
        </div>
    );
}

export default Budget;
