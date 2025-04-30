import React, { useState } from 'react';
import { crearIncidencia } from '../../../Api'; // Importa la función para enviar la incidencia

const categorias = ['fontanería', 'electricidad', 'acabados', 'carpintería', 'humedades'];
const estancias = ['salón', 'cocina', 'dormitorio principal', 'baño 1', 'etc.'];

function Warranty({ onIncidenciaCreada }) {
    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [ubicacionEstancia, setUbicacionEstancia] = useState('');
    const [ubicacionDetalle, setUbicacionDetalle] = useState('');
    const [archivos, setArchivos] = useState([]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('categoria', categoria);
        formData.append('descripcion', descripcion);
        formData.append('ubicacionEstancia', ubicacionEstancia);
        formData.append('ubicacionDetalle', ubicacionDetalle);
        archivos.forEach(archivo => formData.append('archivos', archivo));

        try {
            await crearIncidencia(formData);
            alert('Incidencia reportada con éxito.');
            onIncidenciaCreada();
            // Limpiar el formulario
            setTitulo('');
            setCategoria('');
            setDescripcion('');
            setUbicacionEstancia('');
            setUbicacionDetalle('');
            setArchivos([]);
        } catch (error) {
            console.error('Error al reportar la incidencia:', error);
            alert('Hubo un error al reportar la incidencia.');
        }
    };

    const handleArchivoChange = (event) => {
        setArchivos([...archivos, ...event.target.files]);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="titulo">Título de la Incidencia:</label>
                <input
                    type="text"
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="categoria">Categoría de la Incidencia:</label>
                <select
                    id="categoria"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="descripcion">Descripción Detallada:</label>
                <textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows="5"
                    required
                ></textarea>
            </div>
            <div>
                <label htmlFor="ubicacionEstancia">Estancia:</label>
                <select
                    id="ubicacionEstancia"
                    value={ubicacionEstancia}
                    onChange={(e) => setUbicacionEstancia(e.target.value)}
                    required
                >
                    <option value="">Seleccionar estancia</option>
                    {estancias.map((estancia) => (
                        <option key={estancia} value={estancia}>{estancia}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="ubicacionDetalle">Detalles de la Ubicación:</label>
                <input
                    type="text"
                    id="ubicacionDetalle"
                    value={ubicacionDetalle}
                    onChange={(e) => setUbicacionDetalle(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="archivos">Adjuntar Archivos (Imágenes/Videos):</label>
                <input
                    type="file"
                    id="archivos"
                    multiple
                    onChange={handleArchivoChange}
                    accept="image/*, video/*"
                />
            </div>
            <button type="submit">Enviar Reporte</button>
        </form>
    );
}

export default Warranty;