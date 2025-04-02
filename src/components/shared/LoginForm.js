import React, { useState } from "react";
import "../../App.css";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/auth/login', {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        navigate('/perfil'); 
      } else {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      if (error.response && error.response.status === 401) {
        setError('Credenciales incorrectas.');
      } else {
        setError('Error al conectar con el servidor.');
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-4"
        style={{
          maxWidth: "400px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Link to="/" style={{ color: "#ff9800" ,  textDecoration: "none" }}>
        <h2 className="text-center mb-4 ">
          zimenta
        </h2>
        </Link>
        <h4 className="text-center mb-4">Inicia Sesión</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Usuario"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>
          <div className="form-group mb-4">
            <div className="input-group">
              <input
                type={passwordVisible ? "text" : "password"}
                className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <div className="input-group-append">
                <button
                  className="btn btn-outline-warning"
                  type="button"
                  onClick={togglePasswordVisibility}
                >
                  {passwordVisible ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="btn-zimenta btn-block"
            style={{ backgroundColor: "#ff9800", borderColor: "#ff9800" }}
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-3 text-center">
          <a href="#">Olvidé mi contraseña</a>
        </div>

        <p className="mt-3 text-center">
          By continuing, you agree to the{" "}
          <Link to="/terms-use">Terms of Use</Link> and{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;