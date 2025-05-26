import { Outlet } from "react-router-dom";
import WorkerSidebar from "./WorkerSidebar";

const WorkerLayout = () => {
  return (
    <div className="client-layout">
      <WorkerSidebar/>
      <Outlet />
    </div>
  );
};

export default WorkerLayout;
