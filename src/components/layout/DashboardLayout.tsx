import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import PageHeader from "./PageHeader";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 pb-0">
          <PageHeader />
        </div>
        <main className="flex-1 overflow-y-auto p-6 pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
