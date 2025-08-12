import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage.jsx';
import Dashboard from './components/pages/Dashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthModal from './components/Authmodal.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authChanged, setAuthChanged] = useState(0); // trigger re-evaluation of ProtectedRoute

  const showLoginModal = () => {
    setAuthMode('login');
    setAuthModalVisible(true);
  };

  const handleCloseModal = () => {
    setAuthModalVisible(false);
  };

  const handleAuthSuccess = (type, userData) => {
    localStorage.setItem('token', userData.token); // store token
    setAuthChanged(prev => prev + 1);              // trigger re-render
    setAuthModalVisible(false);                    // close modal
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            // <ProtectedRoute triggerLoginModal={showLoginModal}>
              <Dashboard />
            // </ProtectedRoute>
          }
        />
      </Routes>

      <AuthModal
        open={authModalVisible}
        mode={authMode}
        onClose={handleCloseModal}
        onSuccess={handleAuthSuccess}
        switchMode={() =>
          setAuthMode((prev) => (prev === 'login' ? 'register' : 'login'))
        }
      />

      <ToastContainer position="bottom-right" autoClose={1000} theme="colored" />
    </>
  );
}

export default App;
