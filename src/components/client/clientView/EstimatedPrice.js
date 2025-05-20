import React, { useState } from "react";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import "./ClientView.css";

const EstimatedPrice = ({ precio }) => {
    const [verPrecio, setVerPrecio] = useState(false);

    const toggleVerPrecio = () => setVerPrecio(!verPrecio);

    const formatearPrecio = (precio) =>
        new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
        }).format(precio);

    return (
        <div>
            <div
                style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}
                className="price-container"
            >
                <div
                    onClick={toggleVerPrecio}
                    style={{ cursor: "pointer", marginRight: "5px" }}
                    className="price-toggle"
                >
                    {verPrecio ? <EyeFill size={20} /> : <EyeSlashFill size={20} />}
                </div>
                <span style={{ fontWeight: "bold" }}>ESTIMATED PRICE</span>
            </div>
            <div
                style={{
                    fontSize: "1.5em",
                    fontWeight: "bold",
                    color: "#ff8c00",
                    opacity: verPrecio ? 1 : 0.3,
                }}
                className="price-display"
            >
                {verPrecio ? formatearPrecio(precio) : "********"}
            </div>
        </div>
    );
};

export default EstimatedPrice;