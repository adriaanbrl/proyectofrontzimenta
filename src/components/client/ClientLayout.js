import { Outlet } from "react-router-dom";
import Sidebar from "../shared/Sidebar";

const ClientLayout = () => {
  return (
    <div className="client-layout">
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default ClientLayout;
