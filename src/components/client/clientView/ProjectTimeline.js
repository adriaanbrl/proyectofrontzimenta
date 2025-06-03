import React, { useState } from "react";
import { Col, Modal, Button } from "react-bootstrap";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    try {
        const date = new Date(dateString);
        return date
            .toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })
            .replace(/ de /g, " ");
    } catch (error) {
        console.error("Error formatting date:", error);
        return "Fecha inválida";
    }
};

const ProjectTimeline = ({ timelineItems }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [eventoModal, setEventoModal] = useState(null);

    const handleCloseModal = () => {
        setModalVisible(false);
        setEventoModal(null);
    };

    const handleEventClick = (item) => {
        setEventoModal(item);
        setModalVisible(true);
    };

    return (
        <Col md={12}>
            <h2 className="fs-4 fw-bold text-start mb-3">LÍNEA DE TIEMPO DEL PROYECTO</h2>
            <div style={{ overflowX: "auto" }}>
                <div
                    className="position-relative"
                    style={{
                        height: "80px",
                        width: `${Math.max(1, timelineItems.length * 120)}px`,
                        paddingLeft: "20px",
                    }}
                >
                    <div
                        className="w-100 bg-secondary"
                        style={{
                            height: "2px",
                            position: "absolute",
                            top: "50%",
                            left: "0%",
                            width: "100%",
                        }}
                    ></div>
                    {timelineItems.map((item, index) => {
                        if (!item.date) return null;
                        let position;
                        // Adjusted firstElementOffset to move the first event slightly less to the right
                        const firstElementOffset = 6; // Changed from 10 to 6
                        if (timelineItems.length > 1) {
                            const availableSpace = 100 - firstElementOffset;
                            const spacing = availableSpace / (timelineItems.length - 1);
                            position = firstElementOffset + index * spacing;
                        } else {
                            position = 50;
                        }
                        const titleTop = index % 2 === 0 ? "-20px" : "20px";
                        const titleTextAlign = "center";
                        return (
                            <div
                                key={index}
                                className="position-absolute"
                                style={{
                                    left: `${position}%`,
                                    top: "50%",
                                    cursor: "pointer",
                                    transform: "translateX(-50%) translateY(-50%)",
                                }}
                                onClick={() => handleEventClick(item)}
                            >
                                <div
                                    className={`rounded-circle`}
                                    style={{
                                        width: "10px",
                                        height: "10px",
                                        backgroundColor: "#f5922c",
                                    }}
                                    title={item.title}
                                ></div>
                                <div
                                    style={{
                                        position: "absolute",
                                        top: titleTop,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        fontSize: "0.8rem",
                                        whiteSpace: "nowrap",
                                        textAlign: titleTextAlign,
                                    }}
                                >
                                    {item.title}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal show={modalVisible} onHide={handleCloseModal}>
                {eventoModal && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>{eventoModal.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="mb-3">
                <span className="fw-bold" style={{ color: "orange" }}>
                  {formatDate(eventoModal.date || eventoModal.fecha)}
                </span>
                            </div>
                            <p>{eventoModal.description || "Sin descripción"}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Cerrar
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </Col>
    );
};

export default ProjectTimeline;
