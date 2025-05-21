import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="client-layout">
      <AdminSidebar/>
      <Outlet />
    </div>
  );
};

export default AdminLayout;
