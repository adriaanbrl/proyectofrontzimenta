import React, { useState, useEffect, useRef } from "react";
import { Card, Form, Button, ListGroup, InputGroup } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import moment from 'moment';
import 'moment/locale/es';

function ClientChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const chatContainerRef = useRef(null);
    const websocket = useRef(null);
    const location = useLocation();
    const [workerId, setWorkerId] = useState(null);
    const [customerId, setCustomerId] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [workerName, setWorkerName] = useState("");

    useEffect(() => {
        console.log("useEffect con location.search ejecutado (Client)");
        const queryParams = new URLSearchParams(location.search);
        setWorkerId(queryParams.get("workerId"));
        const fetchedWorkerName = queryParams.get("workerName");
        if (fetchedWorkerName) {
            setWorkerName(fetchedWorkerName);
        }

        const fetchCustomerIdAndHistory = async () => {
            const token = localStorage.getItem("authToken");
            console.log("Token recuperado (Client):", token);
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    setCustomerId(decodedToken.id);
                    setAuthToken(token);
                    console.log("workerId (Client):", workerId, "customerId (Client):", customerId);
                } catch (decodeError) {
                    console.error("Error decoding token (Client):", decodeError);
                }
            }
        };
        fetchCustomerIdAndHistory();
    }, [location.search]);

    useEffect(() => {
        if (workerId && customerId && authToken) {
            loadChatHistory(customerId, "customer", parseInt(workerId), "worker");
        }
    }, [workerId, customerId, authToken]);

    const loadChatHistory = async (user1Id, user1Type, user2Id, user2Type) => {
        console.log("authToken en loadChatHistory (Client):", authToken);
        if (authToken) {
            try {
                const response = await fetch(
                    `http://localhost:8080/api/chat/history?user1Id=${user1Id}&user1Type=${user1Type}&user2Id=${user2Id}&user2Type=${user2Type}`,
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (response.ok) {
                    const history = await response.json();
                    console.log("Historial cargado (Client):", history);
                    setMessages(history);
                } else {
                    console.error("Error al cargar el historial del chat (Client):", response.status);
                }
            } catch (error) {
                console.error("Error al cargar el historial del chat (Client):", error);
            }
        }
    };

    useEffect(() => {
        if (authToken) {
            websocket.current = new WebSocket("http://localhost:8080/chat");

            websocket.current.onopen = () => {
                console.log("Conexión WebSocket establecida (Client).");
            };

            websocket.current.onmessage = (event) => {
                const messageData = JSON.parse(event.data);
                console.log("Mensaje recibido por WebSocket (Client):", messageData);
                setMessages((prevMessages) => [...prevMessages, messageData]);
            };

            websocket.current.onclose = () => {
                console.log("Conexión WebSocket cerrada (Client).");
            };

            websocket.current.onerror = (error) => {
                console.error("Error en la conexión WebSocket (Client):", error);
            };

            return () => {
                if (
                    websocket.current &&
                    websocket.current.readyState === WebSocket.OPEN
                ) {
                    websocket.current.close();
                }
            };
        }
    }, [authToken]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (
            newMessage.trim() &&
            websocket.current &&
            websocket.current.readyState === WebSocket.OPEN &&
            workerId &&
            customerId
        ) {
            const messagePayload = JSON.stringify({
                senderId: customerId,
                receiverId: parseInt(workerId),
                senderType: "customer",
                receiverType: "worker",
                message: newMessage,
            });
            websocket.current.send(messagePayload);
            setNewMessage("");
        }
    };

    return (
        <Card className="shadow-sm w-100 h-100">
            <Card.Header className="bg-light">
                <div className="header-section d-flex align-items-center justify-content-center mb-4">
                    <h1 className=" flex-grow-1 text-title text-center mb-5 fw-bold fs-2 mt-5">
                        Chat con {workerName || "Trabajador"}
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
                                    msg.senderType === "customer" ? "end" : "start"
                                } mb-2 align-items-end`}
                            >
                                {msg.senderType === "customer" && msg.timestamp && (
                                    <small className="text-muted mr-2 p-3">{moment(msg.timestamp).locale('es').format('LT')}</small>
                                )}
                                <div
                                    className={`${
                                        msg.senderType === "customer"
                                            ? "bg-warning text-white"
                                            : "bg-light text-dark"
                                    } p-2 rounded ${msg.senderType === "customer" ? 'ml-2' : 'mr-2'}`} // Ajustamos el margen
                                    style={{ maxWidth: "70%", wordBreak: "break-word" }}
                                >
                                    <small className="text-muted">
                                        {msg.senderType === "customer" ? "Tú" : workerName || "Trabajador"}
                                    </small>
                                    <p className="mb-0">{msg.message}</p>
                                </div>
                                {msg.senderType !== "customer" && msg.timestamp && (
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

export default ClientChat;