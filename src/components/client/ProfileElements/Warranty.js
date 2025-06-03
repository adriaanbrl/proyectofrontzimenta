import React, { useState, useEffect } from 'react';
import { Button, Form, Alert, Row, Col, Container, Card } from 'react-bootstrap';
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
  const [imagen, setImagen] = useState(null);

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
   
          setError('Error al cargar las categorías.');
        }
      } catch (error) {
   
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

          setError('Error al cargar las estancias.');
        }
      } catch (error) {

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
          body: formData,
        }
      );

      if (response.ok) {
        await response.json();
        alert('Incidencia registrada exitosamente en la base de datos.');
        setTitulo('');
        setDescripcion('');
        setCategoriaId('');
        setEstanciaId('');
        setImagen(null);
      } else {
        const errorText = await response.text();

        setError(`Hubo un error al registrar la incidencia: ${errorText}`);
      }
    } catch (error) {

      setError('Error de red al registrar la incidencia.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingBuildingId) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Cargando información del edificio...</div>;
  }

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow rounded-lg border-0">
            <Card.Body className="p-2">
               <div className="d-flex justify-content-center align-items-center mb-3">
                          <Button
                            variant="link"
                            onClick={handleGoBack}
                            className="back-button me-3"
                            aria-label="Volver atrás"
                            style={{ padding: 0 }}
                          >
                            <ChevronLeft size={20} color="orange" />
                          </Button>
                          <h2 className="historic-title text-center mb-0">Reportar Incidencias</h2>
                        </div>
              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="titulo">
                  <Form.Label className="fw-semibold">Título de la Incidencia:</Form.Label>
                  <Form.Control
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    placeholder="Ej: Fuga en tubería del baño"
                    className="rounded-pill border-0 shadow-sm"
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Form.Group as={Col} md="6" controlId="categoriaId" className='mt-2'>
                    <Form.Label className="fw-semibold">Categoría de la Incidencia:</Form.Label>
                    <Form.Control
                      as="select"
                      value={categoriaId}
                      onChange={(e) => setCategoriaId(e.target.value)}
                      className="rounded-pill border-0 shadow-sm"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>

                  <Form.Group as={Col} md="6" controlId="estanciaId" className='mt-2'>
                    <Form.Label className="fw-semibold">Estancia:</Form.Label>
                    <Form.Control
                      as="select"
                      value={estanciaId}
                      onChange={(e) => setEstanciaId(e.target.value)}
                      className="rounded-pill border-0 shadow-sm"
                    >
                      <option value="">Seleccionar estancia</option>
                      {estancias.map((estancia) => (
                        <option key={estancia.id} value={estancia.id}>{estancia.name}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="descripcion">
                  <Form.Label className="fw-semibold mt-2">Descripción Detallada:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    placeholder="Describa detalladamente el problema..."
                    className="rounded-lg border-0 shadow-sm"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="imagen">
                  <Form.Label className="fw-semibold">Imagen de la Incidencia (opcional):</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleImagenChange}
                    className="rounded-pill border-0 shadow-sm"
                  />
                  {imagen && (
                    <div className="mt-2 text-muted small">
                      <File size={16} className="me-1" />
                      {imagen.name}
                    </div>
                  )}
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-100 rounded-pill fw-bold shadow mb-4"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Warranty;