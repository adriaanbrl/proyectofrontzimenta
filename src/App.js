import './App.css';
import GlobalView from "./globalView";
import LoginForm from "./components/LoginForm"; //
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<GlobalView />} /> {/* Ruta para la vista global */}
          <Route path="/login" element={<LoginForm />} /> {/* Ruta para el formulario de inicio de sesión */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;