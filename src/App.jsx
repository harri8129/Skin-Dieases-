import Signup from './componenets/Signup.jsx';
import Login from './componenets/login.jsx';
import LandingPage from './componenets/LandingPage.jsx';
import History from './componenets/History.jsx';
import GenerateReport from './componenets/GenerateReport.jsx';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/history" element={<History/>} />
      <Route path="/generate-report" element={<GenerateReport/>} />
    </Routes>
  );
}

export default App;
