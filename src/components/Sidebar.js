import { useState } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { House, Image, Calendar, ChatDots, Person } from "react-bootstrap-icons";

export default function Sidebar() {
  const [active, setActive] = useState("Inicio");

  const menuItems = [
    { name: "Inicio", icon: <House size={24} /> },
    { name: "Galeria", icon: <Image size={24} /> },
    { name: "Fecha", icon: <Calendar size={24} /> },
    { name: "Chat", icon: <ChatDots size={24} /> },
    { name: "Perfil", icon: <Person size={24} /> }
  ];

  return (
    <Navbar fixed="bottom" className="bg-white shadow-lg p-2 d-flex justify-content-around">
      {menuItems.map((item) => (
        <Nav.Link
          key={item.name}
          className={`text-center ${active === item.name ? "text-warning" : "text-secondary"}`}
          onClick={() => setActive(item.name)}
        >
          <div>{item.icon}</div>
          <small>{item.name}</small>
        </Nav.Link>
      ))}
    </Navbar>
  );
}
