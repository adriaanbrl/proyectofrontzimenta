import React, { useState, useEffect } from "react"; 
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons"; 
import { Col, Row } from "react-bootstrap";
import { jwtDecode } from 'jwt-decode'; 
import "./ClientView.css";


const EstimatedPrice = ({ precio }) => {
    const [verPrecio, setVerPrecio] = useState(false);
    const [buildingTitleFromToken, setBuildingTitleFromToken] = useState("Cargando título..."); 

    const toggleVerPrecio = () => setVerPrecio(!verPrecio);

    const formatearPrecio = (precio) =>
        new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
        }).format(precio);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken.userType === "customer" && decodedToken.building_title) { 
                    setBuildingTitleFromToken(decodedToken.building_title.toUpperCase());
                } else {
                    setBuildingTitleFromToken("TÍTULO NO DISPONIBLE");
                }
            } catch (error) {
                console.error("Error decoding token for building title:", error);
                setBuildingTitleFromToken("ERROR AL CARGAR TÍTULO");
            }
        } else {
            setBuildingTitleFromToken("TÍTULO NO DISPONIBLE");
        }
    }, []); 

    return (
        <div>
            <Row className="align-items-center mb-2">
                <Col xs="auto">
                    {/* Eye icons for price visibility */}
                    <div onClick={toggleVerPrecio} style={{ cursor: "pointer" }}>
                        {verPrecio ? <EyeFill size={20} /> : <EyeSlashFill size={20} />}
                    </div>
                </Col>
                <Col className="fs-5 fw-bold text-start">
                    {/* Display the building's address as the title of the work from the token */}
                    {buildingTitleFromToken}
                </Col>
            </Row>
            <div
                className={`fs-4 fw-bold ${!verPrecio ? "opacity-50" : ""}`}
                style={{ color: "#ff8c00" }}
            >
                {/* Price display section */}
                {verPrecio && precio !== null ? formatearPrecio(precio) : "********"}
            </div>
        </div>
    );
};

export default EstimatedPrice;
