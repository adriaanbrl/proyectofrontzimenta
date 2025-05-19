import { useState } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { House, Image, Calendar, ChatDots, Person } from "react-bootstrap-icons";
import { Link } from 'react-router-dom';
import "./Sidebar.css";

export default function Sidebar() {
  const [active, setActive] = useState("Inicio");

  const menuItems = [
    { name: "Inicio", icon: <House size={24} />, path: "/inicio" },
    { name: "Galeria", icon: <Image size={24} />, path: "/galeriaCliente" },
    { name: "Fecha", icon: <Calendar size={24} />, path: "/calendar" },
    { name: "Chat", icon: <ChatDots size={24} />, path: "/contactos" },
    { name: "Perfil", icon: <Person size={24} />, path: "/perfil" }
  ];

  return (
    <Navbar fixed="bottom" className="sidebar-nav bg-white shadow-lg p-2 d-flex justify-content-around">
      {menuItems.map((item) => (
        <Nav.Item key={item.name}>
          <Link
            to={item.path}
            className={`nav-link text-center ${active === item.name ? "active" : "text-secondary"}`}
            onClick={() => setActive(item.name)}
          >
            <div>{item.icon}</div> {/* Renderiza el componente del icono directamente */}
            <small>{item.name}</small>
          </Link>
        </Nav.Item>
      ))}
    </Navbar>
  );
}