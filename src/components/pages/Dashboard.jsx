import Sidebar from '../SideBar'
import DashboardContent from '../DashboardContent';

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar/>
      <div className="ml-64 w-full min-h-screen bg-gray-50 p-6">
        <DashboardContent/>
      </div>
    </div>
  );
};

export default Dashboard;
