import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import moment from 'moment';
import 'moment/locale/es';
import 'bootstrap/dist/css/bootstrap.min.css';


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
        <div className="d-flex justify-content-center bg-light min-vh-100 pb-4">
            <Card className="shadow-lg mt-3 w-100" style={{ maxWidth: '600px', height: 'calc(100vh - 90px)' }}>
                {/* Header */}
                <Card.Header className="text-white text-center fw-bold fs-4 border-0 py-3 bg-custom" >
                    Chat con {contactName || 'Cliente'}
                </Card.Header>

                {/* Mensajes */}
                <Card.Body className="d-flex flex-column p-0 flex-grow-1 overflow-hidden bg-light">
                    <div ref={chatContainerRef} className="flex-grow-1 overflow-auto p-4">
                        <ListGroup as="ul" className="list-unstyled">
                            {messages.map((msg, index) => (
                                <li
                                    key={index}
                                    className={`d-flex mb-3 align-items-start justify-content-${msg.senderType === 'worker' ? 'end' : 'start'}`}
                                >
                                    <div
                                        className={`px-3 py-2 rounded-4 shadow-sm position-relative ${
                                            msg.senderType === 'worker' ? 'text-white bg-custom' : 'text-dark bg-white'
                                        } ${msg.senderType === 'worker' ? 'rounded-end-4 rounded-start-2' : 'rounded-start-4 rounded-end-2'}`}
                                        style={{ maxWidth: '75%' }}
                                    >
                                        <small className={`d-block fw-semibold mb-1 ${msg.senderType === 'worker' ? 'text-white-50' : 'text-muted'}`}>
                                            {msg.senderType === 'worker' ? 'Tú' : contactName || 'Cliente'}
                                        </small>
                                        <p className="mb-0 small lh-sm">
                                            {msg.message}
                                        </p>
                                    </div>
                                    <small className={`text-muted opacity-75 align-self-end ms-2 ${msg.senderType === 'worker' ? 'text-end' : 'text-start'}`} style={{ fontSize: '0.65rem', minWidth: '40px' }}>
                                        {moment(msg.timestamp).locale('es').format('LT')}
                                    </small>
                                </li>
                            ))}
                        </ListGroup>
                    </div>
                </Card.Body>

                {/* Input */}
                <div className="p-3 border-top bg-white">
                    <Form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Escribe un mensaje..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="rounded-pill border-secondary shadow-none me-2 px-4 py-2"
                            />
                            <Button
                                type="submit"
                                disabled={!isWebSocketConnected}
                                className="rounded-pill px-4 py-2 text-white border-0"
                                style={{ backgroundColor: '#f5922c' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e08427'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f5922c'}
                            >
                                Enviar
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

export default WorkerChat;