import { NavLink, useNavigate } from 'react-router-dom';
import { Home, History, LogOut } from 'lucide-react';
import { clearTokens } from '../utils/api';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Clear tokens from storage
    clearTokens();
    navigate("/");
  };

  const menuItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/dashboard' },
    { name: 'History', icon: <History size={20} />, path: '/dashboard/history' },
  ];
  
  return (
    <div className="h-screen w-64 bg-white shadow-lg fixed top-0 left-0 flex flex-col">
      <div className="p-6 text-2xl font-bold text-blue-600 border-b">
        SkinCare AI
      </div>

      <nav className="flex-1 p-4 space-y-4">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded-md hover:bg-blue-100 ${
                isActive ? 'bg-blue-200 font-semibold' : ''
              }`
            }
          >
            {item.icon} {item.name}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="m-4 p-2 flex items-center gap-2 text-red-600 hover:bg-red-100 rounded-md"
      >
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
};

export default Sidebar;
