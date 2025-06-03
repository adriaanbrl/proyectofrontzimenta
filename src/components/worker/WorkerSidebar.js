import { useState, useEffect } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { House, ChatDots, ListUl } from "react-bootstrap-icons";
import "./WorkerSidebar.css";


export default function WorkerSidebar() {
  const [active, setActive] = useState("");
  const location = useLocation();
  const menuItems = [
    { name: "Inicio", icon: <House size={24} />, path: "/trabajador" },
    { name: "Chat", icon: <ChatDots size={24} />, path: "/listaChat" },
    { name: "Listas", icon: <ListUl size={24} />, path: "/workerDataList" },
  ];
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find((item) => item.path === currentPath);
    if (activeItem) {
      setActive(activeItem.name);
    } else {
      setActive("");
    }
  }, [location.pathname, menuItems]);


  return (
    <Navbar
      fixed="bottom"
      className="sidebar-nav bg-white shadow-lg p-2 d-flex justify-content-around"
    >
      {menuItems.map((item) => (
        <Nav.Item key={item.name}>
          <Link
            to={item.path}
            className={`nav-link text-center ${
              active === item.name ? "active" : "text-secondary"
            }`}
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


