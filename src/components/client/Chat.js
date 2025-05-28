// ClientChat.js
import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ClientChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);
    const websocket = useRef(null);
    const location = useLocation();
    const [workerId, setWorkerId] = useState(null);
    const [customerId, setCustomerId] = useState(null);
    const [authToken, setAuthToken] = useState(null);

    useEffect(() => {
        console.log('useEffect con location.search ejecutado (Client)');
        const queryParams = new URLSearchParams(location.search);
        setWorkerId(queryParams.get('workerId'));

        const fetchCustomerIdAndHistory = async () => {
            const token = localStorage.getItem("authToken");
            console.log('Token recuperado (Client):', token);
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    setCustomerId(decodedToken.id);
                    setAuthToken(token);
                    console.log('workerId (Client):', workerId, 'customerId (Client):', customerId);
                } catch (decodeError) {
                    console.error("Error decoding token (Client):", decodeError);
                }
            }
        };
        fetchCustomerIdAndHistory();
    }, [location.search]);

    useEffect(() => {
        if (workerId && customerId && authToken) {
            loadChatHistory(customerId, 'customer', parseInt(workerId), 'worker');
        }
    }, [workerId, customerId, authToken]);

    const loadChatHistory = async (user1Id, user1Type, user2Id, user2Type) => {
        console.log('authToken en loadChatHistory (Client):', authToken);
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
                    console.log('Historial cargado (Client):', history);
                    setMessages(history);
                } else {
                    console.error('Error al cargar el historial del chat (Client):', response.status);
                }
            } catch (error) {
                console.error('Error al cargar el historial del chat (Client):', error);
            }
        }
    };

    useEffect(() => {
        if (authToken) {
            websocket.current = new WebSocket('http://localhost:8080/chat');

            websocket.current.onopen = () => {
                console.log('Conexión WebSocket establecida (Client).');
            };

            websocket.current.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                setMessages((prevMessages) => [...prevMessages, messageData]);
            };

            websocket.current.onclose = () => {
                console.log('Conexión WebSocket cerrada (Client).');
            };

            websocket.current.onerror = (error) => {
                console.error('Error en la conexión WebSocket (Client):', error);
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
        if (newMessage.trim() && websocket.current && websocket.current.readyState === WebSocket.OPEN && workerId && customerId) {
            const messagePayload = JSON.stringify({
                senderId: customerId,
                receiverId: parseInt(workerId),
                senderType: 'customer',
                receiverType: 'worker',
                message: newMessage,
            });
            websocket.current.send(messagePayload);
            setNewMessage('');
        }
    };

    return (
        <Card>
            <Card.Body>
                <div
                    ref={chatContainerRef}
                    className="mb-3"
                    style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}
                >
                    <ListGroup>
                        {messages.map((msg, index) => (
                            <ListGroup.Item
                                key={index}
                                className={`d-flex justify-content-${msg.senderType === 'customer' ? 'end' : 'start'} align-items-start border-0 mb-1`}
                            >
                                <div
                                    className={`${msg.senderType === 'customer' ? 'bg-info text-white' : 'bg-light text-dark'} p-2 rounded`}
                                    style={{ maxWidth: '70%' }}
                                >
                                    <small className="fw-bold">
                                        {msg.senderType === 'customer' ? 'Tú' : 'Trabajador'}
                                    </small>
                                    <p className="mb-0">{msg.message}</p>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
                <Form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Escribe un mensaje..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="info" type="submit">Enviar</Button>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default ClientChat;