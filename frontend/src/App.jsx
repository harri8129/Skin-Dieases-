import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage.jsx';
import Dashboard from './components/pages/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthModal from './components/Authmodal.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ import the child components
import DashboardContent from './components/DashboardContent.jsx';
import History from './components/History.jsx';

function App() {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authChanged, setAuthChanged] = useState(0);

  const showLoginModal = () => {
    setAuthMode('login');
    setAuthModalVisible(true);
  };

  const handleCloseModal = () => {
    setAuthModalVisible(false);
  };

  const handleAuthSuccess = (type, userData) => {
    localStorage.setItem('user', JSON.stringify(userData.user));
    setAuthChanged(prev => prev + 1);
    setAuthModalVisible(false);
  };

  return (
    <>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected Dashboard with nested routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute triggerLoginModal={showLoginModal} authChanged={authChanged}>
              <Dashboard />   {/* ✅ Sidebar + layout wrapper */}
            </ProtectedRoute>
          }
        >
          {/* Nested routes inside Dashboard */}
          <Route index element={<DashboardContent />} />   {/* /dashboard → DashboardContent */}
          <Route path="history" element={<History />} />   {/* /dashboard/history → History */}
        </Route>
      </Routes>

      {/* Auth Modal */}
      <AuthModal
        open={authModalVisible}
        mode={authMode}
        onClose={handleCloseModal}
        onSuccess={handleAuthSuccess}
        switchMode={() =>
          setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
        }
      />

      {/* Toast Notifications */}
      <ToastContainer position="bottom-right" autoClose={1000} theme="colored" />
    </>
  );
}

export default App;
