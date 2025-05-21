import { useState, useEffect } from "react"; 
import { Navbar, Nav } from "react-bootstrap";
import { Link, useLocation } from 'react-router-dom'; 
import { Wrench, ListUl } from 'react-bootstrap-icons';
import "./AdminSidebar.css";

export default function AdminSidebar() {
    const [active, setActive] = useState("");
    const location = useLocation();
    const menuItems = [
        { name: "Gestor", icon: <Wrench size={24} />, path: "/admin" },
        { name: "Listas", icon: <ListUl size={24} />, path: "/dataList" }
    ];
    useEffect(() => {
        const currentPath = location.pathname;
        const activeItem = menuItems.find(item => item.path === currentPath);
        if (activeItem) {
            setActive(activeItem.name);
        } else {
            setActive("");
        }
    }, [location.pathname, menuItems]); 

    return (
        <Navbar fixed="bottom" className="sidebar-nav bg-white shadow-lg p-2 d-flex justify-content-around">
            {menuItems.map((item) => (
                <Nav.Item key={item.name}>
                    <Link
                        to={item.path}
                        className={`nav-link text-center ${active === item.name ? "active" : "text-secondary"}`}
                        onClick={() => setActive(item.name)}
                    >
                        <div className="icon-container">{item.icon}</div>
                        <small>{item.name}</small>
                    </Link>
                </Nav.Item>
            ))}
        </Navbar>
    );
}
