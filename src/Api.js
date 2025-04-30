// src/services/api.js
const API_BASE_URL = 'http://localhost:8080/api'; // Ajusta la URL de tu backend

// Función para verificar el estado del proyecto
export const checkProjectStatus = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/proyecto/estado`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.estado; // Asumiendo que la respuesta tiene un campo 'estado'
    } catch (error) {
        console.error("Error al verificar el estado del proyecto:", error);
        throw error;
    }
};

// Función para crear una nueva incidencia para un edificio específico
export const crearIncidencia = async (buildingId, formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/incidents`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al crear la incidencia para el edificio ${buildingId}:`, error);
        throw error;
    }
};

// Función para obtener todas las incidencias de un usuario (asumiendo autenticación JWT)
export const obtenerIncidenciasUsuario = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/incidencias/me`, {
            headers: {
                'Authorization': `Bearer ${token}`, // Incluye el token JWT en la cabecera
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error al obtener las incidencias del usuario:", error);
        throw error;
    }
};

// Función para obtener todas las incidencias de un edificio específico
export const obtenerIncidenciasPorEdificio = async (buildingId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/incidents`, {
            headers: {
                'Authorization': `Bearer ${token}`, // Incluye el token JWT en la cabecera (si es necesario)
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener las incidencias del edificio ${buildingId}:`, error);
        throw error;
    }
};

// Función para obtener los detalles de una incidencia específica dentro de un edificio
export const obtenerDetalleIncidencia = async (buildingId, incidentId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/incidents/${incidentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`, // Incluye el token JWT en la cabecera (si es necesario)
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener el detalle de la incidencia ${incidentId} del edificio ${buildingId}:`, error);
        throw error;
    }
};

// Función para actualizar el estado de una incidencia específica dentro de un edificio
export const actualizarEstadoIncidencia = async (buildingId, incidentId, estado, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/buildings/${buildingId}/incidents/${incidentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Incluye el token JWT en la cabecera (si es necesario)
            },
            body: JSON.stringify({ status: estado }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error al actualizar el estado de la incidencia ${incidentId} del edificio ${buildingId}:`, error);
        throw error;
    }
};