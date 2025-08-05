import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthModal from './Authmodal';

function Navbar() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState(null); // 'login' or 'register'
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');

  useEffect(() => {
    // Listen for login/logout changes (optional: use a global state or event)
    const handleStorage = () => setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/dashboard');
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1
                  className="text-2xl font-bold text-purple-600 cursor-pointer"
                  onClick={() => navigate('/')}
                >
                  SkinAI
                </h1>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Home
                </button>
                {isLoggedIn && (
                  <button
                    onClick={() => navigate('/history')}
                    className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    History
                  </button>
                )}
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              {!isLoggedIn && (
                <>
                  <button
                    onClick={() => setAuthMode('login')}
                    className="bg-white border border-purple-600 text-purple-600 px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:bg-purple-50 shadow"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Register
                  </button>
                </>
              )}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:bg-red-600 shadow"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        open={!!authMode}
        mode={authMode}
        onClose={() => setAuthMode(null)}
        switchMode={() =>
          setAuthMode(authMode === 'login' ? 'register' : 'login')
        }
        onSuccess={(type, data) => {
          if (type === 'register') setAuthMode('login');
          else {
            setAuthMode(null);
            setIsLoggedIn(true);
            navigate('/dashboard');
          }
        }}
      />
    </>
  );
}

export default Navbar;
