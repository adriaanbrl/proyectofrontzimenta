import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Tabs, Tab, Button } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const DataList = () => {
    const [buildings, setBuildings] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                                                {/* Building entity now only has address, startDate, endDate */}
                                                <Card.Title className="text-primary">{building.address}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">ID: {building.id}</Card.Subtitle> {/* Displaying ID as it's a primary key and useful */}
                                                <Card.Text>
                                                    Dirección: {building.address}<br/>
                                                    Fecha de Inicio: {building.startDate ? new Date(building.startDate).toLocaleDateString() : 'N/A'}<br/>
                                                    Fecha de Finalización: {building.endDate ? new Date(building.endDate).toLocaleDateString() : 'N/A'}
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
                                                {/* Worker entity now has 'name' and 'surname' directly */}
                                                <Card.Title className="text-success">{worker.name} {worker.surname}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">ID: {worker.id}</Card.Subtitle> {/* Displaying ID */}
                                                <Card.Text>
                                                    Nombre Completo: {worker.name} {worker.surname}<br/>
                                                    Contacto: {worker.contact || 'N/A'}
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
                                                {/* Customer entity now has 'name' and 'surname' directly */}
                                                <Card.Title className="text-info">{customer.name} {customer.surname}</Card.Title>
                                                <Card.Subtitle className="mb-2 text-muted">{customer.email}</Card.Subtitle>
                                                <Card.Text>
                                                    Nombre Completo: {customer.name} {customer.surname}<br/>
                                                    Email: {customer.email}<br/>
                                                    Username: {customer.username || 'N/A'}<br/>
                                                    Obra: {customer.building ? customer.building.address : 'N/A'}<br/>
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
