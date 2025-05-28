import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup, InputGroup } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { BsSendFill } from 'react-icons/bs'; // Importar el icono de envío
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
    const [contactName, setContactName] = useState(""); // Para el título

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
                try {
                    const decodedToken = jwtDecode(token);
                    setWorkerId(decodedToken.id);
                    setAuthToken(token);
                    console.log('contactId (Worker):', contactId, 'workerId (Worker):', workerId);
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
        if (authToken) {
            websocket.current = new WebSocket('http://localhost:8080/chat');

            websocket.current.onopen = () => {
                console.log('Conexión WebSocket establecida (Worker).');
            };

            websocket.current.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                setMessages((prevMessages) => [...prevMessages, messageData]);
            };

            websocket.current.onclose = () => {
                console.log('Conexión WebSocket cerrada (Worker).');
            };

            websocket.current.onerror = (error) => {
                console.error('Error en la conexión WebSocket (Worker):', error);
            };

            return () => {
                if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                    websocket.current.close();
                }
            };
        }
    }, [authToken]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() && websocket.current && websocket.current.readyState === WebSocket.OPEN && contactId && workerId) {
            const messagePayload = JSON.stringify({
                senderId: workerId,
                receiverId: parseInt(contactId),
                senderType: 'worker',
                receiverType: 'customer',
                message: newMessage,
            });
            websocket.current.send(messagePayload);
            setNewMessage('');
        }
    };

    return (
        <Card className="shadow-sm w-100 h-100">
            <Card.Header className="bg-light">
                <div className="header-section d-flex align-items-center justify-content-center mb-4">
                    <h1 className=" flex-grow-1 text-title text-center mb-5 fw-bold fs-2 mt-5">
                        Chat con {contactName || "Cliente"}
                    </h1>
                </div>
            </Card.Header>
            <Card.Body className="d-flex flex-column">
                <div
                    ref={chatContainerRef}
                    className="mb-3 flex-grow-1 overflow-auto p-3"
                    style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "5px",
                        maxHeight: "400px",
                    }}
                >
                    <ListGroup className="list-unstyled">
                        {messages.map((msg, index) => (
                            <li
                                key={index}
                                className={`d-flex justify-content-${
                                    msg.senderType === 'worker' ? 'end' : 'start'
                                } mb-2 align-items-end`}
                            >
                                {msg.senderType === 'worker' && msg.timestamp && (
                                    <small className="text-muted mr-2">{moment(msg.timestamp).locale('es').format('LT')}</small>
                                )}
                                <div
                                    className={`${
                                        msg.senderType === 'worker'
                                            ? 'bg-warning text-white'
                                            : 'bg-light text-dark'
                                    } p-2 rounded ${msg.senderType === 'worker' ? 'ml-2' : 'mr-2'}`}
                                    style={{ maxWidth: '70%', wordBreak: 'break-word' }}
                                >
                                    <small className="text-muted">
                                        {msg.senderType === 'worker' ? 'Tú' : contactName || 'Cliente'}
                                    </small>
                                    <p className="mb-0">{msg.message}</p>
                                </div>
                                {msg.senderType !== 'worker' && msg.timestamp && (
                                    <small className="text-muted ml-2">{moment(msg.timestamp).locale('es').format('LT')}</small>
                                )}
                            </li>
                        ))}
                    </ListGroup>
                </div>
                <Form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                >
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Escribe un mensaje..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button variant="primary" type="submit">
                            Enviar
                        </Button>
                    </InputGroup>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default WorkerChat;