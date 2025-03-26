import React, { useState } from "react";
import { Link } from "react-router-dom";

function LoginForm() {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
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
        <h2 className="text-center mb-4" style={{ color: "#ff9800" }}>
          zimenta
        </h2>
        <h4 className="text-center mb-4">Inicia Sesión</h4>
        <form>
          <div className="form-group mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Usuario"
            />
          </div>
          <div className="form-group mb-4">
            <div className="input-group">
              <input
                type={passwordVisible ? "text" : "password"}
                className="form-control"
                placeholder="Contraseña"
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
            className="btn btn-primary btn-block"
            style={{ backgroundColor: "#ff9800", borderColor: "#ff9800" }}
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-3 text-center">
          
          <a href="#">
            Olvidé mi contraseña
          </a>
        </div>

        <p className="mt-3 text-center">
          By continuing, you agree to the <a href="#">Terms of Use</a> and{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;
