import "./App.css";
import GlobalView from "./components/global/GlobalView";
import ClientView from "./components/client/ClientView";
import LoginForm from "./components/shared/LoginForm";
import PrivacyPolicy from "./components/shared/PrivacyPolicy";
import TermsUse from "./components/shared/TermsUse";
import Gallery from "./components/global/Gallery";
import Sidebar from "./components/shared/Sidebar";
import Profile from "./components/client/Profile";
import Chat from "./components/client/Chat";
import EventCalendar from "./components/client/EventCalendar";
import ClientGallery from "./components/client/ClientGallery";
import TestProfileImage from "./TestProfileImage.js";
import ClientLayout from "./components/client/ClientLayout";
import LegDoc from "./components/client/ProfileElements/LegDoc.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-use" element={<TermsUse />} />
          <Route path="/test-profile-image" element={<TestProfileImage />} />

          {/* Rutas de Vista Global */}
          <Route path="/" element={<GlobalView />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:galleryName" element={<Gallery />} />

          {/* Rutas de Vista Cliente */}
          <Route element={<ClientLayout />}>
            <Route path="/inicio" element={<ClientView />} />
            <Route path="/galeriaCliente" element={<ClientGallery />} />
            <Route path="/calendar" element={<EventCalendar />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/documentacion" element={<LegDoc />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
