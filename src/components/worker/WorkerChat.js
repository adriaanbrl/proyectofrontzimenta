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
            const isScrolledToBottom = chatContainerRef.current.scrollHeight - chatContainerRef.current.clientHeight <= chatContainerRef.current.scrollTop + 1;
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

            setMessages((prevMessages) => [...prevMessages, messageObject]);

            setNewMessage('');
        } else if (!isWebSocketConnected) {
            console.log("La conexión WebSocket no está activa. Intenta reconectar o espera.");
        }
    };

    return (
        // Eliminar 'align-items-center' para que el contenido se alinee arriba
        // Ajustar minHeight para que ocupe la altura total si es deseado
        <div className="d-flex justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#e0e0e0', paddingBottom: '20px' }}>
            <Card className="shadow-lg" style={{
                borderRadius: '12px',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '600px',
                // *** ¡Ajusta este valor de '90px' si es necesario para el sidebar! ***
                height: 'calc(100vh - 90px)', // Deja espacio para tu barra de navegación inferior
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f8f9fa',
                marginTop: '20px' // Añadir un margin-top fijo para asegurar que no se pegue al borde superior
            }}>
                {/* Encabezado */}
                <Card.Header
                    className="py-3 text-center"
                    style={{
                        backgroundColor: '#f5922c',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.6rem',
                        borderBottom: 'none'
                    }}
                >
                    Chat con {contactName || "Cliente"}
                </Card.Header>

                {/* Área de mensajes */}
                <Card.Body className="d-flex flex-column p-0" style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <div
                        ref={chatContainerRef}
                        className="flex-grow-1 overflow-auto p-4"
                        style={{
                            backgroundColor: '#f8f9fa',
                        }}
                    >
                        <ListGroup className="list-unstyled">
                            {messages.map((msg, index) => (
                                <li
                                    key={index}
                                    className={`d-flex justify-content-${
                                        msg.senderType === 'worker' ? 'end' : 'start'
                                    } mb-3 align-items-start`}
                                >
                                    {/* Burbuja de mensaje */}
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
                                            borderRadius: msg.senderType === 'worker' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                            margin: '0 8px',
                                            padding: '10px 15px',
                                        }}
                                    >
                                        <small
                                            className="mb-1 d-block"
                                            style={{
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                color: msg.senderType === 'worker' ? 'rgba(255,255,255,0.9)' : '#7a7a7a',
                                            }}
                                        >
                                            {msg.senderType === 'worker' ? 'Tú' : contactName || 'Cliente'}
                                        </small>
                                        <p className="mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                                            {msg.message}
                                        </p>
                                    </div>
                                    {/* Hora del mensaje */}
                                    <small className="text-muted" style={{ fontSize: '0.65rem', opacity: 0.7, alignSelf: 'flex-end', minWidth: '40px', textAlign: msg.senderType === 'worker' ? 'right' : 'left' }}>
                                        {moment(msg.timestamp).locale('es').format('LT')}
                                    </small>
                                </li>
                            ))}
                        </ListGroup>
                    </div>
                </Card.Body>

                {/* Área de entrada de texto */}
                <div className="p-3" style={{ borderTop: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                        }}
                    >
                        <InputGroup className="mb-0">
                            <Form.Control
                                type="text"
                                placeholder="Escribe un mensaje..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                style={{
                                    padding: '12px 18px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '25px',
                                    boxShadow: 'none',
                                    outline: 'none',
                                    flexGrow: 1,
                                    marginRight: '10px'
                                }}
                                className="focus-ring focus-ring-primary"
                            />
                            <Button
                                type="submit"
                                disabled={!isWebSocketConnected}
                                style={{
                                    backgroundColor: '#f5922c',
                                    borderColor: '#f5922c',
                                    color: 'white',
                                    padding: '12px 20px',
                                    borderRadius: '25px',
                                    transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e08427'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f5922c'}
                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
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