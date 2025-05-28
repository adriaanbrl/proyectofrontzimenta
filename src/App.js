import "./App.css";
import GlobalView from "./components/global/GlobalView";
import ClientView from "./components/client/clientView/ClientView";
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
import Invoice from "./components/client/ProfileElements/Invoice.js";
import Budget from "./components/client/ProfileElements/Budget.js";
import Warranty from "./components/client/ProfileElements/Warranty.js";
import Manual from "./components/client/ProfileElements/Manual.js";
import Historic from "./components/client/ProfileElements/Historic.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ContactList from "./components/client/ContactList.js";
import Admin from "./components/admin/Admin.js";
import Worker from "./components/worker/workerView/Worker.js";
import DataList from "./components/admin/DataList.js";
import AdminLayout from "./components/admin/AdminLayout.js";
import WorkerLayout from "./components/worker/WorkerLayout.js";
import WorkerContactList from "./components/worker/WorkerContactList.js";
import WorkerDataList from "./components/worker/WorkerDataList.js";
import WorkerChat from "./components/worker/WorkerChat.js";


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
            <Route path="/contactos" element={<ContactList />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/documentacion" element={<LegDoc />} />
            <Route path="/factura" element={<Invoice />} />
            <Route path="/presupuesto" element={<Budget />} />
            <Route path="/garantia" element={<Warranty />} />
            <Route path="/manual" element={<Manual />} />
            <Route path="/historial" element={<Historic />} />
          </Route>

          {/* Rutas de Vista Admin */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/dataList" element={<DataList />} />
          </Route>

          {/* Rutas de Vista Trabajador */}
          <Route element={<WorkerLayout />}>
            <Route path="/trabajador" element={<Worker />} />
            <Route path="/listaChat" element={<WorkerContactList />} />
            <Route path="/chatTrabajador" element={<WorkerChat />} />
            <Route path="/workerDataList" element={<WorkerDataList />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
