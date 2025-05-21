import { useState } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { Wrench, ListUl } from 'react-bootstrap-icons';
import "./AdminSidebar.css";

export default function AdminSidebar() {
    const [active, setActive] = useState("");

    const menuItems = [
        { name: "Gestor", icon: <Wrench size={24} />, path: "/admin" },
        { name: "Listas", icon: <ListUl size={24} />, path: "/dataList" }
    ];
    
    return (
        <Navbar fixed="bottom" className="admin-sidebar-nav bg-white shadow-lg p-2 d-flex justify-content-around">
            {menuItems.map((item) => (
                <Nav.Item key={item.name}>
                    <Link
                        to={item.path}
                        className={`nav-link text-center ${active === item.name ? "active" : "text-secondary"}`}
                        onClick={() => setActive(item.name)}
                    >
                        <div>{item.icon}</div>
                        <small>{item.name}</small>
                    </Link>
                </Nav.Item>
            ))}
        </Navbar>
    );
}