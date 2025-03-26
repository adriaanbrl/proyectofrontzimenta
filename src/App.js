import './App.css';
import GlobalView from "./globalView";
import LoginForm from "./components/LoginForm";
import PrivacyPolicy from "./components/PrivacyPolicy"; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<GlobalView />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;