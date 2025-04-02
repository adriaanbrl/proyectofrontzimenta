import './App.css';
import GlobalView from "./globalView";
import LoginForm from "./components/LoginForm";
import PrivacyPolicy from "./components/PrivacyPolicy"; 
import TermsUse from "./components/TermsUse";
import Gallery from './Gallery';
import TestProfileImage from './testprofileimage.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Profile from "./components/Profile";


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<GlobalView />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-use" element={<TermsUse />} />  
          <Route path="/gallery" element={<Gallery />} />  
          <Route path="/gallery/:galleryName" element={<Gallery />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/test-profile-image" element={<TestProfileImage />} />
        </Routes>
        <Sidebar />
      </div>
    </Router>
  );
}

export default App;