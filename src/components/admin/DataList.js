import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Tabs, Tab, Button } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Importa useSearchParams
import AdminSidebar from './AdminSidebar';

const DataList = () => {
    const [buildings, setBuildings] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Usa useSearchParams para leer y establecer parámetros de URL
    const [searchParams, setSearchParams] = useSearchParams();
    // 2. Inicializa activeTab basándose en el parámetro 'tab' de la URL, o 'buildings' por defecto
    const initialTabFromUrl = searchParams.get('tab') || 'buildings';
    const [activeTab, setActiveTab] = useState(initialTabFromUrl);

    const navigate = useNavigate();
    const API_BASE_URL = 'http://localhost:8080/auth';

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
    }, [activeTab]); // Ejecuta cuando `activeTab` cambie para actualizar el título

    // 3. Este useEffect se encarga de sincronizar el estado `activeTab`
    // con el parámetro `tab` de la URL si el usuario navega directamente
    // a una URL con un parámetro diferente (ej. desde el sidebar con /dataList?tab=workers)
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl);
        }
    }, [searchParams, activeTab]); // Depende de searchParams y activeTab

    const fetchData = async (token) => {
        setLoading(true);
        setError(null);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        try {
            const buildingsResponse = await fetch(`${API_BASE_URL}/admin/buildings`, { headers });
            if (!buildingsResponse.ok) throw new Error(`Error al cargar construcciones: ${buildingsResponse.statusText}`);
            const buildingsData = await buildingsResponse.json();
            setBuildings(buildingsData);

            const workersResponse = await fetch(`${API_BASE_URL}/admin/workers`, { headers });
            if (!workersResponse.ok) throw new Error(`Error al cargar trabajadores: ${workersResponse.statusText}`);
            const workersData = await workersResponse.json();
            setWorkers(workersData);

            const customersResponse = await fetch(`${API_BASE_URL}/admin/customers`, { headers });
            if (!customersResponse.ok) throw new Error(`Error al cargar clientes: ${customersResponse.statusText}`);
            const customersData = await customersResponse.json();
            setCustomers(customersData);

        } catch (err) {
            console.error("Error al cargar datos:", err);
            setError(`Error al cargar datos: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 4. Función para manejar el cambio de pestaña y actualizar la URL
    const handleTabSelect = (key) => {
        setActiveTab(key);
        setSearchParams({ tab: key }); // Actualiza el parámetro 'tab' en la URL
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

                <Tabs
                    id="admin-dashboard-tabs"
                    activeKey={activeTab}
                    onSelect={handleTabSelect} // Usa la función handleTabSelect aquí
                    className="mb-3"
                >
                    <Tab eventKey="buildings" title="Construcciones">
                        <Row>
                            {buildings.length > 0 ? (
                                buildings.map(building => (
                                    <Col md={6} lg={4} className="mb-4" key={building.id}>
                                        <Card className="shadow-sm">
                                            <Card.Body>
                                                <Card.Title className="text-primary">{building.name}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">{building.address}</Card.Subtitle>
                                                <Card.Text>
                                                    Ciudad: {building.city}<br/>
                                                    Código Postal: {building.postalCode}<br/>
                                                    País: {building.country}
                                                </Card.Text>
                                            </Card.Body>
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
                                                <Card.Title className="text-success">{worker.firstName} {worker.lastName}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">{worker.email}</Card.Subtitle>
                                                <Card.Text>
                                                    Teléfono: {worker.phone}<br/>
                                                    Rol: {worker.role}
                                                </Card.Text>
                                            </Card.Body>
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
                                                <Card.Title className="text-info">{customer.firstName} {customer.lastName}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">{customer.email}</Card.Subtitle>
                                                <Card.Text>
                                                    Teléfono: {customer.phone}<br/>
                                                    Dirección: {customer.address}
                                                </Card.Text>
                                            </Card.Body>
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
            </Container>
            <AdminSidebar />
        </div>
    );
};

export default DataList;