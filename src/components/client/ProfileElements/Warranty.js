import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

function Warranty({ onIncidenciaCreada }) {
    const location = useLocation();
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [estanciaId, setEstanciaId] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [estancias, setEstancias] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [buildingId, setBuildingId] = useState(null);
    const [loadingBuildingId, setLoadingBuildingId] = useState(true);

    useEffect(() => {
        document.title = "Reportar Incidencia de Garantía";
        if (location.state && location.state.building_id) {
            setBuildingId(location.state.building_id);
            setLoadingBuildingId(false);
        } else {
            setError("No se proporcionó el ID del edificio.");
            setLoadingBuildingId(false);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/categorias');
                if (response.ok) {
                    const data = await response.json();
                    setCategorias(data);
                } else {
                    console.error('Error al cargar las categorías:', response.status);
                    setError('Error al cargar las categorías.');
                }
            } catch (error) {
                console.error('Error de red al cargar las categorías:', error);
                setError('Error de red al cargar las categorías.');
            }
        };

        const fetchEstancias = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/estancias');
                if (response.ok) {
                    const data = await response.json();
                    setEstancias(data);
                } else {
                    console.error('Error al cargar las estancias:', response.status);
                    setError('Error al cargar las estancias.');
                }
            } catch (error) {
                console.error('Error de red al cargar las estancias:', error);
                setError('Error de red al cargar las estancias.');
            }
        };

        fetchCategories();
        fetchEstancias();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!buildingId) {
            setError('No se pudo obtener el ID del edificio.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/api/buildings/${buildingId}/incidents?categoryId=${parseInt(categoriaId, 10)}&roomId=${parseInt(estanciaId, 10)}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: titulo,
                        status: 'Pendiente',
                        description: descripcion,
                        building: { // Incluye el objeto building en el cuerpo
                            id: buildingId,
                        },
                    }),
                }
            );

            if (response.ok) {
                const savedIncident = await response.json();
                alert('Incidencia registrada exitosamente en la base de datos.');
                onIncidenciaCreada(savedIncident);
                setTitulo('');
                setDescripcion('');
                setCategoriaId('');
                setEstanciaId('');
            } else {
                const errorText = await response.text(); // Leer la respuesta como texto para ver el HTML
                console.error('Error al registrar la incidencia:', response.status, errorText);
                setError(`Hubo un error al registrar la incidencia: ${errorText}`);
            }
        } catch (error) {
            console.error('Error de red al registrar la incidencia:', error);
            setError('Error de red al registrar la incidencia.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingBuildingId) {
        return <div>Cargando información del edificio...</div>;
    }

    if (error) {
        return <div className="alert alert-danger">{error}</div>;
    }

    return (
        <div className="p-4 rounded-lg shadow-md bg-light">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reportar Incidencia de Garantía</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="form-group">
                    <label htmlFor="titulo" className="text-sm font-medium text-gray-700">Título de la Incidencia:</label>
                    <Form.Control
                        type="text"
                        id="titulo"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                        placeholder="Ej: Fuga en tubería del baño"
                        className="mt-1"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="categoriaId" className="text-sm font-medium text-gray-700">Categoría de la Incidencia:</label>
                    <Form.Control
                        as="select"
                        id="categoriaId"
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        className="mt-1"
                    >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </Form.Control>
                </div>
                <div className="form-group">
                    <label htmlFor="descripcion" className="text-sm font-medium text-gray-700">Descripción Detallada:</label>
                    <Form.Control
                        as="textarea"
                        id="descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={5}
                        required
                        placeholder="Describa detalladamente el problema..."
                        className="mt-1"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="estanciaId" className="text-sm font-medium text-gray-700">Estancia:</label>
                    <Form.Control
                        as="select"
                        id="estanciaId"
                        value={estanciaId}
                        onChange={(e) => setEstanciaId(e.target.value)}
                        className="mt-1"
                    >
                        <option value="">Seleccionar estancia</option>
                        {estancias.map((estancia) => (
                            <option key={estancia.id} value={estancia.id}>{estancia.name}</option>
                        ))}
                    </Form.Control>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-100">
                    {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                </Button>
            </form>
        </div>
    );
}

export default Warranty;