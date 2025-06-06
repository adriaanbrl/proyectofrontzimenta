import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup, InputGroup, Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import 'moment/locale/es';


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

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        setContactId(queryParams.get('contactId'));
        const fetchedContactName = queryParams.get('contactName');
        if (fetchedContactName) {
            setContactName(fetchedContactName);
        }

        const fetchWorkerIdAndHistory = async () => {
            const token = localStorage.getItem("authToken");
            if (token) {
                setAuthToken(token);
                try {
                    const decodedToken = jwtDecode(token);
                    setWorkerId(decodedToken.id);

                    websocket.current = new WebSocket('ws://localhost:8080/chat'); 

                    websocket.current.onopen = () => {

                        setIsWebSocketConnected(true);
                    };

                    websocket.current.onmessage = (event) => {
                        const messageData = JSON.parse(event.data);
                        setMessages((prevMessages) => [...prevMessages, messageData]);
                    };

                    websocket.current.onclose = () => {

                        setIsWebSocketConnected(false);
                    };

                    websocket.current.onerror = (error) => {
     
                        setIsWebSocketConnected(false);
                    };

                    return () => {
                        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                            websocket.current.close();
                        }
                    };
                } catch (decodeError) {
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

    // Función para obtener el historial del chat desde el backend
    const loadChatHistory = async (user1Id, user1Type, user2Id, user2Type) => {
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
                    setMessages(history);
                } else {
                }
            } catch (error) {
              
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

            setNewMessage(''); 
        } else if (!isWebSocketConnected) {
           
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100 p-3 mb-5">
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
                                            borderRadius: '1.25rem', 
                                            backgroundColor: msg.senderType === 'worker' ? '#f5922c' : '#ffffff',
                                            color: msg.senderType === 'worker' ? '#ffffff' : '#212529',
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
                <div className="p-3 border-top bg-white rounded-bottom-4 mb-2" >
                    <Form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Escribe un mensaje..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="rounded-pill border-secondary shadow-none me-2 px-4 py-2"
                                style={{
                                    borderColor: '#ced4da', 
                                    outline: 'none', 
                                    boxShadow: 'none' 
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
        </Container>
    );
}
