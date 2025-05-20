import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

function ClientChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);
    const websocket = useRef(null);

    useEffect(() => {
        websocket.current = new WebSocket('http://localhost:8080/chat');
        websocket.current.onopen = () => {
            console.log('Conexión WebSocket establecida.');
        };

        websocket.current.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, messageData]);
        };

        websocket.current.onclose = () => {
            console.log('Conexión WebSocket cerrada.');
        };

        websocket.current.onerror = (error) => {
            console.error('Error en la conexión WebSocket:', error);
        };

        // Limpiar la conexión al desmontar el componente
        return () => {
            if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                websocket.current.close();
            }
        };
    }, []);

    useEffect(() => {
        // Scroll al final del chat cuando hay nuevos mensajes
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim() && websocket.current && websocket.current.readyState === WebSocket.OPEN) {
            const messagePayload = JSON.stringify({
                sender: 'client', // O podrías tener un estado para el nombre del cliente
                text: newMessage,
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
                            className={`alert ${msg.sender === 'admin' ? 'alert-secondary' : 'alert-info'} m-1 ${
                                msg.sender === 'client' ? 'text-end' : ''
                            }`}
                        >
                            <strong>{msg.sender === 'admin' ? 'Admin' : 'Cliente'}:</strong> {msg.text}
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

export default ClientChat;