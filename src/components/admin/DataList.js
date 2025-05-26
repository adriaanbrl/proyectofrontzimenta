import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Tabs, Tab, Button } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import EditFormModal from './EditFormModal'; // Importar el nuevo componente del modal

const DataList = () => {
    const [buildings, setBuildings] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState(null);
    const [editMessage, setEditMessage] = useState(null); // Para mensajes de éxito/error de edición

    // Estados para el modal de edición
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingItemType, setEditingItemType] = useState('');

    const [searchParams, setSearchParams] = useSearchParams();
    const initialTabFromUrl = searchParams.get('tab') || 'buildings';
    const [activeTab, setActiveTab] = useState(initialTabFromUrl);

    const navigate = useNavigate();

    useEffect(() => {
        document.title = `Panel de Administración - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`;

        const token = localStorage.getItem("authToken");

        if (!token) {
            setError("No se encontró el token de autenticación. Por favor, inicie sesión.");
            setLoading(false);
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            fetchData(token);
        } catch (err) {
            console.error("Error al decodificar el token:", err);
            setError("Error al autenticar. El token es inválido o ha expirado.");
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams, activeTab]);

    const fetchData = async (token) => {
        setLoading(true);
        setError(null);
        setDeleteMessage(null);
        setEditMessage(null); // Limpiar mensajes de edición al recargar datos

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const buildingsResponse = await fetch(`http://localhost:8080/auth/admin/buildings`, { headers });
            if (!buildingsResponse.ok) {
                if (buildingsResponse.status === 403) {
                    throw new Error("Acceso denegado. Es posible que no tenga los permisos necesarios o su sesión haya expirado.");
                }
                throw new Error(`Error al cargar construcciones: ${buildingsResponse.statusText}`);
            }
            const buildingsData = await buildingsResponse.json();
            setBuildings(buildingsData);

            const workersResponse = await fetch(`http://localhost:8080/auth/admin/workers`, { headers });
            if (!workersResponse.ok) {
                if (workersResponse.status === 403) {
                    throw new Error("Acceso denegado. Es posible que no tenga los permisos necesarios o su sesión haya expirado.");
                }
                throw new Error(`Error al cargar trabajadores: ${workersResponse.statusText}`);
            }
            const workersData = await workersResponse.json();
            setWorkers(workersData);

            const customersResponse = await fetch(`http://localhost:8080/auth/admin/customers`, { headers });
            if (!customersResponse.ok) {
                if (customersResponse.status === 403) {
                    throw new Error("Acceso denegado. Es posible que no tenga los permisos necesarios o su sesión haya expirado.");
                }
                throw new Error(`Error al cargar clientes: ${customersResponse.statusText}`);
            }
            const customersData = await customersResponse.json();
            setCustomers(customersData);

        } catch (err) {
            console.error("Error al cargar datos:", err);
            setError(`Error al cargar datos: ${err.message}`);
            if (err.message.includes("Acceso denegado") || err.message.includes("token es inválido o ha expirado")) {
                setTimeout(() => navigate('/login'), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTabSelect = (key) => {
        setActiveTab(key);
        setSearchParams({ tab: key });
    };

    const handleDelete = async (id, type) => {
        const confirmDelete = window.confirm(`¿Estás seguro de que quieres eliminar este ${type} (ID: ${id})?`);
        if (!confirmDelete) {
            return;
        }

        setLoading(true);
        setError(null);
        setDeleteMessage(null);
        setEditMessage(null);

        const token = localStorage.getItem("authToken");
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        let endpoint = '';
        switch (type) {
            case 'building':
                endpoint = `http://localhost:8080/auth/admin/buildings/${id}`;
                break;
            case 'worker':
                endpoint = `http://localhost:8080/auth/admin/workers/${id}`;
                break;
            case 'customer':
                endpoint = `http://localhost:8080/auth/admin/customers/${id}`;
                break;
            default:
                setError("Tipo de entidad desconocido para borrar.");
                setLoading(false);
                return;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al eliminar ${type}: ${response.statusText} - ${errorText}`);
            }

            setDeleteMessage(`¡${type.charAt(0).toUpperCase() + type.slice(1)} eliminado(a) con éxito!`);
            fetchData(token);

        } catch (err) {
            console.error(`Error al eliminar ${type}:`, err);
            setError(`Error al eliminar ${type}: ${err.message}`);
            setLoading(false);
        }
    };

    // Función para abrir el modal de edición
    const handleEdit = (item, type) => {
        setEditingItem(item);
        setEditingItemType(type);
        setShowEditModal(true);
    };

    // Función para cerrar el modal de edición
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingItem(null); // Limpiar el elemento en edición
        setEditingItemType('');
    };

    // Función para guardar los cambios (aquí irá la lógica de PUT al backend)
    const handleSaveEdit = async (updatedItem, type) => {
        console.log(`Guardando cambios para ${type}:`, updatedItem);
        // Aquí iría la llamada a la API PUT/PATCH para actualizar el elemento en el backend
        // Por ahora, solo es un placeholder
        setLoading(true);
        setError(null);
        setEditMessage(null);

        const token = localStorage.getItem("authToken");
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        let endpoint = '';
        switch (type) {
            case 'building':
                endpoint = `http://localhost:8080/auth/admin/buildings/${updatedItem.id}`;
                break;
            case 'worker':
                endpoint = `http://localhost:8080/auth/admin/workers/${updatedItem.id}`;
                // For worker, ensure all expected fields from the updated schema are sent
                // This assumes updatedItem already contains these fields from the EditFormModal
                break;
            case 'customer':
                endpoint = `http://localhost:8080/auth/admin/customers/${updatedItem.id}`;
                break;
            default:
                setError("Tipo de entidad desconocido para editar.");
                setLoading(false);
                return;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'PUT', // O 'PATCH' si solo actualizas campos parciales
                headers: headers,
                body: JSON.stringify(updatedItem) // Envía el objeto actualizado
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al actualizar ${type}: ${response.statusText} - ${errorText}`);
            }

            setEditMessage(`¡${type.charAt(0).toUpperCase() + type.slice(1)} actualizado(a) con éxito!`);
            fetchData(token); // Vuelve a cargar los datos para reflejar los cambios

        } catch (err) {
            console.error(`Error al actualizar ${type}:`, err);
            setError(`Error al actualizar ${type}: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <div style={{ paddingBottom: '60px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Container className="my-5 text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </Spinner>
                    <p className="mt-2">Cargando datos...</p>
                </Container>
                <AdminSidebar />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ paddingBottom: '60px', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Container className="my-5 text-center">
                    <Alert variant="danger">{error}</Alert>
                    <Button variant="primary" onClick={() => navigate('/login')}>Ir a Iniciar Sesión</Button>
                </Container>
                <AdminSidebar />
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '60px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Container className="my-5 flex-grow-1">
                <h1 className="mb-4 text-center text-custom">Listas de Administración</h1>

                {deleteMessage && <Alert variant="success" className="my-3">{deleteMessage}</Alert>}
                {editMessage && <Alert variant="success" className="my-3">{editMessage}</Alert>}
                {error && <Alert variant="danger" className="my-3">{error}</Alert>}

                <Tabs
                    id="admin-dashboard-tabs"
                    activeKey={activeTab}
                    onSelect={handleTabSelect}
                    className="mb-3"
                >
                    <Tab eventKey="buildings" title="Construcciones">
                        <Row>
                            {buildings.length > 0 ? (
                                buildings.map(building => (
                                    <Col md={6} lg={4} className="mb-4" key={building.id}>
                                        <Card className="shadow-sm">
                                            <Card.Body>
                                                <Card.Title className="text-primary">{building.address}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">ID: {building.id}</Card.Subtitle>
                                                <Card.Text>
                                                    Dirección: {building.address}<br/>
                                                    Fecha de Inicio: {building.startDate ? new Date(building.startDate).toLocaleDateString() : 'N/A'}<br/>
                                                    Fecha de Finalización: {building.endDate ? new Date(building.endDate).toLocaleDateString() : 'N/A'}
                                                </Card.Text>
                                            </Card.Body>
                                            <Card.Footer className="text-end">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleDelete(building.id, 'building')}
                                                >
                                                    🗑️ Borrar
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleEdit(building, 'building')}
                                                >
                                                    ✏️ Editar
                                                </Button>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col className="text-center">
                                    <p className="text-muted">No hay construcciones registradas.</p>
                                </Col>
                            )}
                        </Row>
                    </Tab>

                    <Tab eventKey="workers" title="Trabajadores">
                        <Row>
                            {workers.length > 0 ? (
                                workers.map(worker => (
                                    <Col md={6} lg={4} className="mb-4" key={worker.id}>
                                        <Card className="shadow-sm">
                                            <Card.Body>
                                                <Card.Title className="text-success">{worker.name} {worker.surname}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">ID: {worker.id}</Card.Subtitle>
                                                <Card.Text>
                                                    Nombre: {worker.name}<br/>
                                                    Apellido: {worker.surname}<br/>
                                                    Nombre de Usuario: {worker.username || 'N/A'}<br/>
                                                    Contacto: {worker.contact || 'N/A'}<br/>
                                                    Rol ID: {worker.rol_id || 'N/A'}<br/>
                                                    {/* Consider carefully if you want to display password directly, even for admin */}
                                                    {/* Contraseña: {worker.password ? '******' : 'No Establecida'} */}
                                                </Card.Text>
                                            </Card.Body>
                                            <Card.Footer className="text-end">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleDelete(worker.id, 'worker')}
                                                >
                                                    🗑️ Borrar
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleEdit(worker, 'worker')}
                                                >
                                                    ✏️ Editar
                                                </Button>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col className="text-center">
                                    <p className="text-muted">No hay trabajadores registrados.</p>
                                </Col>
                            )}
                        </Row>
                    </Tab>

                    <Tab eventKey="customers" title="Clientes">
                        <Row>
                            {customers.length > 0 ? (
                                customers.map(customer => (
                                    <Col md={6} lg={4} className="mb-4" key={customer.id}>
                                        <Card className="shadow-sm">
                                            <Card.Body>
                                                <Card.Title className="text-info">{customer.name} {customer.surname}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">{customer.email}</Card.Subtitle>
                                                <Card.Text>
                                                    Nombre Completo: {customer.name} {customer.surname}<br/>
                                                    Email: {customer.email}<br/>
                                                    Username: {customer.username || 'N/A'}<br/>
                                                    Obra: {customer.building?.address || 'N/A'}<br/>
                                                </Card.Text>
                                            </Card.Body>
                                            <Card.Footer className="text-end">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="me-2"
                                                    onClick={() => handleDelete(customer.id, 'customer')}
                                                >
                                                    🗑️ Borrar
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleEdit(customer, 'customer')}
                                                >
                                                    ✏️ Editar
                                                </Button>
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col className="text-center">
                                    <p className="text-muted">No hay clientes registrados.</p>
                                </Col>
                            )}
                        </Row>
                    </Tab>
                </Tabs>

                {/* Modal de Edición */}
                <EditFormModal
                    show={showEditModal}
                    onHide={handleCloseEditModal}
                    item={editingItem}
                    itemType={editingItemType}
                    onSave={handleSaveEdit}
                />
            </Container>
            <AdminSidebar />
        </div>
    );
};

export default DataList;