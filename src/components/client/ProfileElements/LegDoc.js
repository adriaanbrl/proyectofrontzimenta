import React, { useEffect, useState } from 'react';
import './LegDoc.css';
import { useLocation } from 'react-router-dom';

function LegDoc() {
    const location = useLocation();
    const [buildingId, setBuildingId] = useState("");
    const [pdfUrl, setPdfUrl] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = "Documentación Legal";
        if (buildingId !== null) {
            fetchDocumentacionLegal(buildingId);
        } else {
            console.log("building recibido :", location.state.building_id); // <-------------------- AÑADIDO CONSOLE LOG
            setError("No se proporcionó el ID del edificio.");
        }
    }, [buildingId]);

    const fetchDocumentacionLegal = async (id) => {
        try {
            // Obtener el token del almacenamiento local (o donde lo tengas guardado)
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No se encontró el token de autenticación.");
                return;
            }

            const response = await fetch(`http://localhost:8080/auth/building/${id}/documentacionLegal`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Añadir el token al encabezado Authorization
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                // Crear una URL para el blob del PDF
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } else {
                setError(`Error al cargar el documento: ${response.status}`);
            }
        } catch (error) {
            setError(`Error de red: ${error.message}`);
        }
    };

    return (
        <div className="leg-doc-container">
            <h1 className="leg-doc-title">Documentación Legal</h1>
            {error && <p className="error">{error}</p>}
            {pdfUrl && (
                <div className="pdf-card">
                    <button className="pdf-button" onClick={() => window.open(pdfUrl, '_blank')}>
                        Abrir Documento Legal
                    </button>
                </div>
            )}
            {!pdfUrl && !error && <p>Cargando documento...</p>}
        </div>
    );
}

export default LegDoc;