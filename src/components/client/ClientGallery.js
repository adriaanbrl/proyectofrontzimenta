import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './ClientGallery.css';

function ClientGallery() {
    const [groupedImages, setGroupedImages] = useState({});
    const [buildingIdFromToken, setBuildingIdFromToken] = useState(null);
    const [loadingBuildingId, setLoadingBuildingId] = useState(true);
    const [errorBuildingId, setErrorBuildingId] = useState(null);
    const [loadingImages, setLoadingImages] = useState(true);
    const [errorImages, setErrorImages] = useState(null);
    const [expandedRoom, setExpandedRoom] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setBuildingIdFromToken(decodedToken.building_id || null);
            } catch (error) {
                setErrorBuildingId('Error al leer la información del edificio.');
            } finally {
                setLoadingBuildingId(false);
            }
        } else {
            setErrorBuildingId('No se encontró el token de autenticación.');
            setLoadingBuildingId(false);
        }
    }, []);

    useEffect(() => {
        const fetchBuildingImages = async () => {
            if (buildingIdFromToken) {
                setLoadingImages(true);
                setErrorImages(null);
                try {
                    const url = `http://localhost:8080/api/buildings/${buildingIdFromToken}/images`;
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    const grouped = data.reduce((acc, image) => {
                        const roomId = image.roomId || 'sin_habitacion';
                        if (!acc[roomId]) {
                            acc[roomId] = { name: image.roomName || 'Sin Habitación', images: [] };
                        }
                        acc[roomId].images.push(image);
                        return acc;
                    }, {});
                    setGroupedImages(grouped);
                } catch (error) {
                    console.error(`Error fetching imágenes del edificio ${buildingIdFromToken}:`, error);
                    setErrorImages('Error al cargar las imágenes.');
                    setGroupedImages({});
                } finally {
                    setLoadingImages(false);
                }
            }
        };

        fetchBuildingImages();
    }, [buildingIdFromToken]);

    const toggleRoomExpansion = (roomId) => {
        setExpandedRoom(prevExpandedRoom => (prevExpandedRoom === roomId ? null : roomId));
        setSelectedImage(null);
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const lastRoomId = Object.keys(groupedImages)[Object.keys(groupedImages).length - 1];

    return (
        <div className="client-gallery-container">
            <h1 className="gallery-title" style={{ color: '#f5922c' }}>Galería de Imágenes</h1>
            {loadingBuildingId && <p className="loading-message">Cargando ID del edificio...</p>}
            {errorBuildingId && <p className="error-message">{errorBuildingId}</p>}
            {loadingImages && !errorImages && <p className="loading-message">Cargando imágenes...</p>}
            {errorImages && <p className="error-message">{errorImages}</p>}
            {!loadingBuildingId && !errorBuildingId && !loadingImages && !errorImages && Object.keys(groupedImages).length > 0 ? (
                <div className="room-cards-grid">
                    {Object.entries(groupedImages).map(([roomId, roomData]) => (
                        <React.Fragment key={roomId}>
                            <div className="room-card">
                                <div className="card-header" onClick={() => toggleRoomExpansion(roomId)}>
                                    {roomData.images[0]?.imageBase64 && (
                                        <div
                                            className="card-image"
                                            style={{ backgroundImage: `url(${roomData.images[0].imageBase64})` }}
                                        ></div>
                                    )}
                                    <div className="card-info">
                                        <h2 className="card-title">{roomData.name}</h2>
                                        <p className="card-image-count">{roomData.images.length} imágenes</p>
                                    </div>
                                </div>
                                {expandedRoom === roomId && (
                                    <div className={`image-panel expanded`}>
                                        {roomData.images.map(image => (
                                            <img
                                                key={image.id}
                                                src={image.imageBase64}
                                                alt={image.title || 'Imagen'}
                                                className="panel-image"
                                                onClick={() => handleImageClick(image)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                            {roomId === lastRoomId && (
                                <div className="gallery-footer">
                                    <hr className="footer-line" />
                                    <h3 className="footer-title">Planos</h3>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            ) : (!loadingBuildingId && !errorBuildingId && !loadingImages && !errorImages && (
                <p className="no-images">No hay imágenes para este edificio.</p>
            ))}
            {!loadingBuildingId && !errorBuildingId && !buildingIdFromToken && (
                <p className="no-id">ID del edificio no disponible.</p>
            )}

            {selectedImage && (
                <div className="lightbox" onClick={closeLightbox}>
                    <img src={selectedImage.imageBase64} alt={selectedImage.title || 'Imagen grande'} className="lightbox-image" />
                </div>
            )}
        </div>
    );
}

export default ClientGallery;