import Signup from './componenets/Signup.jsx';
import Login from './componenets/login.jsx';
import LandingPage from './componenets/LandingPage.jsx';
import History from './componenets/History.jsx';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './componenets/ProtectedRoute.jsx';
import Dashboard from './componenets/Dashboard.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}

export default App; 
