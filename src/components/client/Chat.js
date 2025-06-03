import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Form,
  Button,
  ListGroup,
  InputGroup,
  Container,
} from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import "moment/locale/es";

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
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setWorkerId(queryParams.get("workerId"));
    const fetchedWorkerName = queryParams.get("workerName");
    if (fetchedWorkerName) {
      setWorkerName(fetchedWorkerName);
    }

    const fetchCustomerIdAndHistory = async () => {
      const token = localStorage.getItem("authToken");

      if (token) {
        setAuthToken(token);
        try {
          const decodedToken = jwtDecode(token);
          setCustomerId(decodedToken.id);

          // Establecer la conexión WebSocket aquí, cuando authToken está disponible
          websocket.current = new WebSocket("ws://localhost:8080/chat");

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
            if (
              websocket.current &&
              websocket.current.readyState === WebSocket.OPEN
            ) {
              websocket.current.close();
            }
          };
        } catch (decodeError) {}
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
          setMessages(history);
        } else {
        }
      } catch (error) {}
    }
  };

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
      const messageObject = {
        senderId: customerId,
        receiverId: parseInt(workerId),
        senderType: "customer",
        receiverType: "worker",
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };
      const messagePayload = JSON.stringify(messageObject);
      websocket.current.send(messagePayload);

      // Actualizar el estado local de los mensajes inmediatamente
      setMessages((prevMessages) => [...prevMessages, messageObject]);

      setNewMessage("");
    } else if (!isWebSocketConnected) {
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 p-3 mb-5">
      <Card
        className="shadow-lg w-100 d-flex flex-column"
        style={{
          maxWidth: "900px",
          height: "calc(100vh - 100px)",
          borderRadius: "1rem",
        }}
      >
        {/* Header */}
        <Card.Header className="text-white text-center fw-bold fs-4 py-3 border-0 rounded-top-4 bg-custom">
          Chat con {workerName || "Trabajador"}
        </Card.Header>

        {/* Mensajes */}
        <Card.Body className="d-flex flex-column p-0 flex-grow-1 overflow-hidden">
          <div ref={chatContainerRef} className="flex-grow-1 overflow-auto p-4">
            <ListGroup as="ul" className="list-unstyled">
              {messages.map((msg, index) => (
                <li
                  key={index}
                  className={`d-flex mb-3 align-items-start ${
                    msg.senderType === "customer"
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  <div
                    className="px-3 py-2 shadow-sm position-relative"
                    style={{
                      maxWidth: "75%",
                      wordBreak: "break-word",
                      borderRadius: "1.25rem",
                      backgroundColor:
                        msg.senderType === "customer" ? "#f5922c" : "#ffffff",
                      color:
                        msg.senderType === "customer" ? "#ffffff" : "#212529",
                      borderBottomRightRadius:
                        msg.senderType === "customer" ? "0.375rem" : "1.25rem",
                      borderBottomLeftRadius:
                        msg.senderType === "worker" ? "0.375rem" : "1.25rem",
                    }}
                  >
                    <small
                      className={`d-block fw-semibold mb-1 ${
                        msg.senderType === "customer"
                          ? "text-white-50"
                          : "text-muted"
                      }`}
                    >
                      {msg.senderType === "customer"
                        ? "Tú"
                        : workerName || "Trabajador"}
                    </small>
                    <p className="mb-0 small lh-sm">{msg.message}</p>
                  </div>
                  <small
                    className={`text-muted opacity-75 align-self-end ${
                      msg.senderType === "customer"
                        ? "ms-2 text-end"
                        : "me-2 text-start"
                    }`}
                    style={{
                      fontSize: "0.65rem",
                      minWidth: "40px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {moment(msg.timestamp).locale("es").format("LT")}
                  </small>
                </li>
              ))}
            </ListGroup>
          </div>
        </Card.Body>

        {/* Input de mensaje */}
        <div className="p-3 border-top bg-white rounded-bottom-4 mb-2">
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
                className="rounded-pill border-secondary shadow-none me-2 px-4 py-2"
                style={{
                  borderColor: "#ced4da",
                  outline: "none",
                  boxShadow: "none",
                }}
              />
              <Button
                type="submit"
                disabled={!isWebSocketConnected}
                className="rounded-pill px-4 py-2 text-white border-0 d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: "#f5922c",
                  transition: "background-color 0.2s ease-in-out",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e08427")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5922c")
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-send"
                >
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

export default ClientChat;
