import Sidebar from '../SideBar';
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full min-h-screen bg-gray-50 p-6">
        <Outlet />   {/* ✅ renders DashboardContent OR History */}
      </div>
    </div>
  );
};

export default Dashboard;
