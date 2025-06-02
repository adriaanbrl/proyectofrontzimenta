import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import 'moment/locale/es';

function WorkerChat() {
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

                    websocket.current = new WebSocket('ws://localhost:8080/chat');

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

                    return () => {
                        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                            websocket.current.close();
                        }
                    };
                } catch (decodeError) {
                    console.error("Error decoding token (Worker):", decodeError);
                }
            }
        };
        fetchWorkerIdAndHistory();
    }, [location.search]);

    useEffect(() => {
        if (contactId && workerId && authToken) {
            loadChatHistory(workerId, 'worker', parseInt(contactId), 'customer');
        }
    }, [contactId, workerId, authToken]);

    const loadChatHistory = async (user1Id, user1Type, user2Id, user2Type) => {
        console.log('authToken en loadChatHistory (Worker):', authToken);
        if (authToken) {
            try {
                const response = await fetch(
                    `http://localhost:8080/api/chat/history?user1Id=${user1Id}&user1Type=${user1Type}&user2Id=${user2Id}&user2Type=${user2Type}`,
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

    useEffect(() => {
        if (chatContainerRef.current) {
            // Desplazar solo si el usuario no ha subido para ver mensajes antiguos
            // o si el mensaje actual es del usuario logueado
            const isScrolledToBottom = chatContainerRef.current.scrollHeight - chatContainerRef.current.clientHeight <= chatContainerRef.current.scrollTop + 1; // +1 para manejar posibles errores de redondeo
            if (isScrolledToBottom || (messages.length > 0 && messages[messages.length - 1].senderId === workerId)) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }
    }, [messages]);

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

            // Actualizar el estado local de los mensajes inmediatamente
            setMessages((prevMessages) => [...prevMessages, messageObject]);

            setNewMessage('');
        } else if (!isWebSocketConnected) {
            console.log("La conexión WebSocket no está activa. Intenta reconectar o espera.");
        }
    };

    return (
        // Contenedor principal para centrar el chat y darle un tamaño máximo
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Card className="shadow-lg" style={{
                borderRadius: '15px',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '600px', // Ancho máximo para el chat en pantallas grandes
                height: 'calc(100vh - 80px)', // Altura que deja espacio para la barra de navegación inferior
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Card.Header
                    className="py-4 text-center"
                    style={{
                        backgroundColor: '#fff9f0',
                        borderBottom: '1px solid #f0f0f0',
                        color: '#333',
                        fontWeight: 'bold',
                        fontSize: '1.8rem'
                    }}
                >
                    Chat con {contactName || "Cliente"}
                </Card.Header>

                <Card.Body className="d-flex flex-column p-4" style={{ backgroundColor: '#fcfcfc', flexGrow: 1, overflow: 'hidden' }}>
                    <div
                        ref={chatContainerRef}
                        className="flex-grow-1 overflow-auto p-3"
                        style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: "10px",
                            backgroundColor: '#ffffff',
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
                            // Eliminamos minHeight aquí porque flex-grow-1 se encargará de esto
                        }}
                    >
                        <ListGroup className="list-unstyled">
                            {messages.map((msg, index) => (
                                <li
                                    key={index}
                                    className={`d-flex justify-content-${
                                        msg.senderType === 'worker' ? 'end' : 'start'
                                    } mb-3 align-items-end`}
                                >
                                    {/* Información de tiempo para mensajes del trabajador (a la izquierda de la burbuja) */}
                                    {msg.senderType === 'worker' && msg.timestamp && (
                                        <small className="text-muted mr-2" style={{ fontSize: '0.75rem', opacity: 0.8, alignSelf: 'flex-end' }}>
                                            {moment(msg.timestamp).locale('es').format('LT')}
                                        </small>
                                    )}
                                    <div
                                        className={`p-3 rounded-lg position-relative ${
                                            msg.senderType === 'worker'
                                                ? 'text-white'
                                                : 'text-dark'
                                        }`}
                                        style={{
                                            maxWidth: '75%',
                                            wordBreak: 'break-word',
                                            backgroundColor: msg.senderType === 'worker' ? '#f5922c' : '#ffffff',
                                            border: msg.senderType === 'worker' ? 'none' : '1px solid #e0e0e0',
                                            borderRadius: '15px',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                            marginLeft: msg.senderType === 'worker' ? '15px' : '0',
                                            marginRight: msg.senderType === 'worker' ? '0' : '15px',
                                            // Asegura que el contenido (nombre, mensaje) tenga espacio
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <small
                                            className="mb-1 d-block"
                                            style={{
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                color: msg.senderType === 'worker' ? 'rgba(255,255,255,0.8)' : '#6c757d',
                                            }}
                                        >
                                            {msg.senderType === 'worker' ? 'Tú' : contactName || 'Cliente'}
                                        </small>
                                        <p className="mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                                            {msg.message}
                                        </p>
                                    </div>
                                    {/* Información de tiempo para mensajes del cliente (a la derecha de la burbuja) */}
                                    {msg.senderType !== 'worker' && msg.timestamp && (
                                        <small className="text-muted ml-2" style={{ fontSize: '0.75rem', opacity: 0.8, alignSelf: 'flex-end' }}>
                                            {moment(msg.timestamp).locale('es').format('LT')}
                                        </small>
                                    )}
                                </li>
                            ))}
                        </ListGroup>
                    </div>
                </Card.Body>

                <div className="p-3" style={{ borderTop: '1px solid #f0f0f0', backgroundColor: '#ffffff' }}>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                    >
                        <InputGroup className="mb-0" style={{ borderRadius: '50px', overflow: 'hidden' }}> {/* mb-0 para eliminar margen inferior */}
                            <Form.Control
                                type="text"
                                placeholder="Escribe un mensaje..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                style={{
                                    padding: '15px 20px',
                                    border: '1px solid #ced4da',
                                    borderRight: 'none',
                                    boxShadow: 'none',
                                    borderRadius: '50px 0 0 50px'
                                }}
                                className="flex-grow-1"
                            />
                            <Button
                                type="submit"
                                disabled={!isWebSocketConnected}
                                style={{
                                    backgroundColor: '#f5922c',
                                    borderColor: '#f5922c',
                                    color: 'white',
                                    padding: '15px 25px',
                                    borderRadius: '0 50px 50px 0',
                                    transition: 'background-color 0.2s ease-in-out'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e08427'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f5922c'}
                            >
                                Enviar
                            </Button>
                        </InputGroup>
                        {!isWebSocketConnected && (
                            <small className="text-danger d-block text-center mt-2">
                                No conectado al chat. Recargando la página puede ayudar.
                            </small>
                        )}
                    </Form>
                </div>
            </Card>
        </div>
    );
}

export default WorkerChat;