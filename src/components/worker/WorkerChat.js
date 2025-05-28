// WorkerChat.js
import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function WorkerChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);
    const websocket = useRef(null);
    const location = useLocation();
    const [contactId, setContactId] = useState(null);
    const [workerId, setWorkerId] = useState(null);
    const [authToken, setAuthToken] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        setContactId(queryParams.get('contactId'));

        const fetchWorkerIdAndHistory = async () => {
            const token = localStorage.getItem("authToken");
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    setWorkerId(decodedToken.id);
                    setAuthToken(token);
                    if (contactId && decodedToken.id) {
                        await loadChatHistory(decodedToken.id, 'worker', parseInt(contactId), 'customer');
                    }
                } catch (decodeError) {
                    console.error("Error decoding token:", decodeError);
                }
            }
        };
        fetchWorkerIdAndHistory();
    }, [location.search]);

    const loadChatHistory = async (user1Id, user1Type, user2Id, user2Type) => {
        if (authToken) {
            try {
                const response = await fetch(
                    `/api/chat/history?user1Id=${user1Id}&user1Type=${user1Type}&user2Id=${user2Id}&user2Type=${user2Type}`,
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
                    console.error('Error al cargar el historial del chat:', response.status);
                }
            } catch (error) {
                console.error('Error al cargar el historial del chat:', error);
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
        <Card>
            <Card.Body>
                <div
                    ref={chatContainerRef}
                    className="mb-3"
                    style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}
                >
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`alert ${msg.senderType === 'worker' ? 'alert-info text-end' : 'alert-secondary'} m-1`}
                        >
                            <strong>{msg.senderType === 'worker' ? 'Trabajador' : 'Cliente'}:</strong> {msg.message}
                        </div>
                    ))}
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

export default WorkerChat;