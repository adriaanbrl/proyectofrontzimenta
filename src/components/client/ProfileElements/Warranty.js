import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { InputGroup, Form, FloatingLabel } from 'react-bootstrap';


const categorias = ['fontanería', 'electricidad', 'acabados', 'carpintería', 'humedades'];
const estancias = ['salón', 'cocina', 'dormitorio principal', 'baño 1', 'etc.'];

// Función mock para simular la inserción en la base de datos
const insertarIncidenciaEnDB = async (
    titulo: string,
    categoria: string,
    descripcion: string,
    ubicacionEstancia: string,
    ubicacionDetalle: string
) => {
    // Simula una llamada a la base de datos con un query SQL
    const query = `
        INSERT INTO zimapp.incidencias (creation_date,description,resdlution_date, status,title , building_id, room_id, category_id)
        VALUES (
            '${titulo}',
            '${categoria}',
            '${descripcion}',
            '${ubicacionEstancia}',
            '${ubicacionDetalle}',
            NOW()
        );
    `;
    console.log('Query SQL simulado:', query); // Muestra el query simulado

    // Simula una respuesta exitosa de la base de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Incidencia registrada exitosamente en la base de datos.' };
};

function Warranty({ onIncidenciaCreada }) {
    const [titulo, setTitulo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [ubicacionEstancia, setUbicacionEstancia] = useState('');
    const [ubicacionDetalle, setUbicacionDetalle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await insertarIncidenciaEnDB(
                titulo,
                categoria,
                descripcion,
                ubicacionEstancia,
                ubicacionDetalle
            );
            if (result.success) {
                alert(result.message);
                onIncidenciaCreada();
                // Limpiar el formulario
                setTitulo('');
                setCategoria('');
                setDescripcion('');
                setUbicacionEstancia('');
                setUbicacionDetalle('');
            } else {
                alert('Hubo un error al registrar la incidencia.');
            }
        } catch (error) {
            console.error('Error al registrar la incidencia:', error);
            alert('Hubo un error al registrar la incidencia.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 rounded-lg shadow-md bg-light">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Reportar Incidencia de Garantía</h2>
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
                    <label htmlFor="categoria" className="text-sm font-medium text-gray-700">Categoría de la Incidencia:</label>
                    <Form.Control
                        as="select"
                        id="categoria"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        required
                        className="mt-1"
                    >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
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
                    <label htmlFor="ubicacionEstancia" className="text-sm font-medium text-gray-700">Estancia:</label>
                    <Form.Control
                        as="select"
                        id="ubicacionEstancia"
                        value={ubicacionEstancia}
                        onChange={(e) => setUbicacionEstancia(e.target.value)}
                        required
                        className="mt-1"
                    >
                        <option value="">Seleccionar estancia</option>
                        {estancias.map((estancia) => (
                            <option key={estancia} value={estancia}>{estancia}</option>
                        ))}
                    </Form.Control>
                </div>
                <div className="form-group">
                    <label htmlFor="ubicacionDetalle" className="text-sm font-medium text-gray-700">Detalles de la Ubicación:</label>
                    <Form.Control
                        type="text"
                        id="ubicacionDetalle"
                        value={ubicacionDetalle}
                        onChange={(e) => setUbicacionDetalle(e.target.value)}
                        placeholder="Ej: Junto al lavabo, en la pared izquierda"
                        className="mt-1"
                    />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-100">
                    {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                </Button>
            </form>
        </div>
    );
}

export default Warranty;

