import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';
import { useLocation } from 'react-router-dom'; // Asumiendo que react-router-dom está disponible en tu entorno
import { jwtDecode } from 'jwt-decode'; // Asumiendo que jwt-decode está disponible en tu entorno
import moment from 'moment';
import 'moment/locale/es';
import 'bootstrap/dist/css/bootstrap.min.css'; // El CSS de Bootstrap sigue siendo necesario y se importa aquí.


// El componente WorkerChat es ahora la exportación predeterminada
export default function WorkerChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);
    const websocket = useRef(null);
    const location = useLocation();
    const [contactId, setContactId] = useState(null);
    const [workerId, setWorkerId] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [contactName, setContactName] = useState("");
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

    // No se añaden scripts de Tailwind CSS ni bloques <style> personalizados.

    // Efecto para analizar los parámetros de consulta y establecer la conexión WebSocket
    useEffect(() => {
        console.log('useEffect con location.search ejecutado (Worker)');
        const queryParams = new URLSearchParams(location.search);
        setContactId(queryParams.get('contactId'));
        const fetchedContactName = queryParams.get('contactName');
        if (fetchedContactName) {
            setContactName(fetchedContactName);
        }

        const fetchWorkerIdAndHistory = async () => {
            const token = localStorage.getItem("authToken");
            console.log('Token recuperado (Worker):', token);
            if (token) {
                setAuthToken(token);
                try {
                    const decodedToken = jwtDecode(token);
                    setWorkerId(decodedToken.id);
                    console.log('contactId (Worker):', contactId, 'workerId (Worker):', workerId);

                    // Inicializar la conexión WebSocket
                    websocket.current = new WebSocket('ws://localhost:8080/chat'); // Endpoint: SIN CAMBIOS

                    websocket.current.onopen = () => {
                        console.log('Conexión WebSocket establecida (Worker).');
                        setIsWebSocketConnected(true);
                    };

                    websocket.current.onmessage = (event) => {
                        const messageData = JSON.parse(event.data);
                        setMessages((prevMessages) => [...prevMessages, messageData]);
                    };

                    websocket.current.onclose = () => {
                        console.log('Conexión WebSocket cerrada (Worker).');
                        setIsWebSocketConnected(false);
                    };

                    websocket.current.onerror = (error) => {
                        console.error('Error en la conexión WebSocket (Worker):', error);
                        setIsWebSocketConnected(false);
                    };

                    // Función de limpieza para WebSocket
                    return () => {
                        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                            websocket.current.close();
                        }
                    };
                } catch (decodeError) {
                    console.error("Error decodificando el token (Worker):", decodeError);
                }
            }
        };
        fetchWorkerIdAndHistory();
    }, [location.search]); // Se ejecuta de nuevo si los parámetros de búsqueda de la ubicación cambian

    // Efecto para cargar el historial del chat una vez que contactId, workerId y authToken estén disponibles
    useEffect(() => {
        if (contactId && workerId && authToken) {
            loadChatHistory(workerId, 'worker', parseInt(contactId), 'customer');
        }
    }, [contactId, workerId, authToken]); // Se ejecuta de nuevo cuando estas dependencias cambian

    // Función para obtener el historial del chat desde el backend
    const loadChatHistory = async (user1Id, user1Type, user2Id, user2Type) => {
        console.log('authToken en loadChatHistory (Worker):', authToken);
        if (authToken) {
            try {
                const response = await fetch(
                    `http://localhost:8080/api/chat/history?user1Id=${user1Id}&user1Type=${user1Type}&user2Id=${user2Id}&user2Type=${user2Type}`, // Endpoint: SIN CAMBIOS
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (response.ok) {
                    const history = await response.json();
                    console.log('Historial cargado (Worker):', history);
                    setMessages(history);
                } else {
                    console.error('Error al cargar el historial del chat (Worker):', response.status);
                }
            } catch (error) {
                console.error('Error al cargar el historial del chat (Worker):', error);
            }
        }
    };

    // Efecto para desplazar automáticamente al final del chat cuando llegan nuevos mensajes
    useEffect(() => {
        if (chatContainerRef.current) {
            // Comprobar si el usuario ya está cerca del final o si el nuevo mensaje es del usuario actual
            const { scrollHeight, clientHeight, scrollTop } = chatContainerRef.current;
            const isScrolledToBottom = scrollHeight - clientHeight <= scrollTop + 1;
            if (isScrolledToBottom || (messages.length > 0 && messages[messages.length - 1].senderId === workerId)) {
                chatContainerRef.current.scrollTop = scrollHeight;
            }
        }
    }, [messages, workerId]); // Se ejecuta de nuevo cuando los mensajes o workerId cambian

    // Manejador para enviar un nuevo mensaje
    const handleSendMessage = () => {
        if (newMessage.trim() && websocket.current && websocket.current.readyState === WebSocket.OPEN && contactId && workerId) {
            const messageObject = {
                senderId: workerId,
                receiverId: parseInt(contactId),
                senderType: 'worker',
                receiverType: 'customer',
                message: newMessage.trim(),
                timestamp: new Date().toISOString(),
            };
            const messagePayload = JSON.stringify(messageObject);
            websocket.current.send(messagePayload);

            // Añadir el mensaje de forma optimista a la UI
            setMessages((prevMessages) => [...prevMessages, messageObject]);

            setNewMessage(''); // Limpiar el campo de entrada
        } else if (!isWebSocketConnected) {
            console.log("La conexión WebSocket no está activa. Intenta reconectar o espera.");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 p-3" style={{ backgroundColor: '#f0f2f5' }}>
            <Card className="shadow-lg w-100 d-flex flex-column" style={{ maxWidth: '900px', height: 'calc(100vh - 100px)', borderRadius: '1rem' }}>
                {/* Encabezado del chat */}
                <Card.Header className="text-white text-center fw-bold fs-4 py-3 border-0 rounded-top-4" style={{ backgroundColor: '#f5922c', borderBottom: '3px solid rgba(255, 255, 255, 0.2)' }}>
                    Chat con {contactName || 'Cliente'}
                </Card.Header>

                {/* Cuerpo de los mensajes */}
                <Card.Body className="d-flex flex-column p-0 flex-grow-1 overflow-hidden" style={{ backgroundColor: '#f8f9fa', borderRadius: '0 0 1rem 1rem' }}>
                    <div ref={chatContainerRef} className="flex-grow-1 overflow-auto p-4">
                        <ListGroup as="ul" className="list-unstyled">
                            {messages.map((msg, index) => (
                                <li
                                    key={index}
                                    className={`d-flex mb-3 align-items-start ${msg.senderType === 'worker' ? 'justify-content-end' : 'justify-content-start'}`}
                                >
                                    <div
                                        className={`px-3 py-2 shadow-sm position-relative`}
                                        style={{
                                            maxWidth: '75%',
                                            wordBreak: 'break-word',
                                            borderRadius: '1.25rem', // Bordes más redondeados para las burbujas
                                            backgroundColor: msg.senderType === 'worker' ? '#f5922c' : '#ffffff',
                                            color: msg.senderType === 'worker' ? '#ffffff' : '#212529',
                                            // Ajustes para las esquinas inferiores de las burbujas
                                            borderBottomRightRadius: msg.senderType === 'worker' ? '0.375rem' : '1.25rem',
                                            borderBottomLeftRadius: msg.senderType === 'customer' ? '0.375rem' : '1.25rem'
                                        }}
                                    >
                                        <small className={`d-block fw-semibold mb-1 ${msg.senderType === 'worker' ? 'text-white-50' : 'text-muted'}`}>
                                            {msg.senderType === 'worker' ? 'Tú' : contactName || 'Cliente'}
                                        </small>
                                        <p className="mb-0 small lh-sm">
                                            {msg.message}
                                        </p>
                                    </div>
                                    <small className={`text-muted opacity-75 align-self-end ${msg.senderType === 'worker' ? 'ms-2 text-end' : 'me-2 text-start'}`} style={{ fontSize: '0.65rem', minWidth: '40px', whiteSpace: 'nowrap' }}>
                                        {moment(msg.timestamp).locale('es').format('LT')}
                                    </small>
                                </li>
                            ))}
                        </ListGroup>
                    </div>
                </Card.Body>

                {/* Área de entrada de mensajes */}
                <div className="p-3 border-top bg-white" style={{ borderRadius: '0 0 1rem 1rem' }}>
                    <Form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Escribe un mensaje..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="rounded-pill border-secondary shadow-none me-2 px-4 py-2"
                                style={{
                                    borderColor: '#ced4da', // Color de borde por defecto de Bootstrap
                                    outline: 'none', // Eliminar el contorno en foco
                                    boxShadow: 'none' // Eliminar la sombra en foco
                                }}
                            />
                            <Button
                                type="submit"
                                disabled={!isWebSocketConnected}
                                className="rounded-pill px-4 py-2 text-white border-0 d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: '#f5922c', transition: 'background-color 0.2s ease-in-out' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e08427'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f5922c'}
                            >
                                {/* Icono de enviar SVG */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                                <span className="ms-2">Enviar</span>
                            </Button>
                        </InputGroup>
                        {!isWebSocketConnected && (
                            <small className="text-danger text-center d-block mt-2">
                                No conectado al chat. Recargando la página puede ayudar.
                            </small>
                        )}
                    </Form>
                </div>
            </Card>
        </div>
    );
}
