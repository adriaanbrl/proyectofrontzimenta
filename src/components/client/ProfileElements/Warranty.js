import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, File } from 'lucide-react';

function Warranty() {
  const location = useLocation();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [estanciaId, setEstanciaId] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [estancias, setEstancias] = useState([]);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [buildingId, setBuildingId] = useState(null);
  const [loadingBuildingId, setLoadingBuildingId] = useState(true);
  const [imagen, setImagen] = useState(null); // Nuevo estado para la imagen

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

  const handleImagenChange = (event) => {
    setImagen(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!buildingId) {
      setError('No se pudo obtener el ID del edificio.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', titulo);
    formData.append('description', descripcion);
    formData.append('categoryId', parseInt(categoriaId, 10));
    formData.append('roomId', parseInt(estanciaId, 10));
    if (imagen) {
      formData.append('image', imagen);
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/buildings/${buildingId}/incidents?categoryId=${parseInt(categoriaId, 10)}&roomId=${parseInt(estanciaId, 10)}`,
        {
          method: 'POST',
          body: formData, // Usar FormData para enviar archivos
        }
      );

      if (response.ok) {
        await response.json();
        alert('Incidencia registrada exitosamente en la base de datos.');
        setTitulo('');
        setDescripcion('');
        setCategoriaId('');
        setEstanciaId('');
        setImagen(null); // Limpiar el estado de la imagen
      } else {
        const errorText = await response.text();
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

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="p-4 rounded-lg shadow-md bg-light">
      <div className="d-flex justify-content-center align-items-center mb-4">
        <Button
          variant="link"
          onClick={handleGoBack}
          className="back-button me-3"
          aria-label="Volver atrás"
          style={{ padding: 0 }}
        >
          <ChevronLeft size={20} color="orange" />
        </Button>
        <h1 className="text-center mb-0">Reportar Incidencia</h1>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="titulo">
            <Form.Label>Título de la Incidencia:</Form.Label>
            <Form.Control
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Ej: Fuga en tubería del baño"
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="categoriaId">
            <Form.Label>Categoría de la Incidencia:</Form.Label>
            <Form.Control
              as="select"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group as={Col} md="6" controlId="estanciaId">
            <Form.Label>Estancia:</Form.Label>
            <Form.Control
              as="select"
              value={estanciaId}
              onChange={(e) => setEstanciaId(e.target.value)}
            >
              <option value="">Seleccionar estancia</option>
              {estancias.map((estancia) => (
                <option key={estancia.id} value={estancia.id}>{estancia.name}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Row>

        <Form.Group className="mb-3" controlId="descripcion">
          <Form.Label>Descripción Detallada:</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            placeholder="Describa detalladamente el problema..."
          />
        </Form.Group>

        {/* Nuevo campo para la imagen */}
        <Form.Group className="mb-3" controlId="imagen">
          <Form.Label>Imagen de la Incidencia (opcional):</Form.Label>
          <Form.Control
            type="file"
            onChange={handleImagenChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={isSubmitting} className="w-100">
          {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
        </Button>
      </Form>
    </div>
  );
}

export default Warranty;