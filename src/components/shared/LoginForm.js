import React, { useState } from "react";
import "../../App.css";
import { Link, useNavigate } from "react-router-dom";
import { Container, Col, Card, Form, Button, InputGroup } from "react-bootstrap";
import axios from "axios";

function LoginForm() {
  const [username, setUsername] = useState(""); // Estado para almacenar el nombre de usuario ingresado.
  const [password, setPassword] = useState(""); // Estado para almacenar la contraseña ingresada.
  const [usernameError, setUsernameError] = useState(false); // Estado para indicar si hay un error en el nombre de usuario
  const [passwordError, setPasswordError] = useState(false); // Estado para indicar si hay un error en la contraseña.
  const [error, setError] = useState(""); // Estado para almacenar mensajes de error durante el inicio de sesión.
  const [passwordVisible, setPasswordVisible] = useState(false); // Estado para controlar la visibilidad de la contraseña.
  const navigate = useNavigate(); // Hook para la navegación entre rutas.
  
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  // Función para actualizar el estado 'password' cuando el valor del input cambia.
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // Función para alternar la visibilidad de la contraseña.
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      // Realiza una petición POST a la API de inicio de sesión.
      const response = await axios.post("http://localhost:8080/auth/login", {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem("authToken", token);
        navigate("/inicio");
        setUsernameError(false);
        setPasswordError(false);
      } else {
        setError("Error al iniciar sesión. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      if (error.response && error.response.status === 401) {
        setError("Usuario o Contraseña Incorrecta.");
        setUsernameError(true);
        setPasswordError(true);
      } else {
        setError("Error al conectar con el servidor.");
      }
    }
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
    <Card
      className="p-4"
      style={{
        maxWidth: "400px",
        borderRadius: "10px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Card.Body>
        <Link to="/" style={{ color: "#ff9800", textDecoration: "none" }}>
          <h2 className="text-center mb-4">zimenta</h2>
        </Link>
        <h4 className="text-center mb-4">Inicia Sesión</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              className={usernameError ? "is-invalid" : ""}
              placeholder="Usuario"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <InputGroup>
              <Form.Control
                type={passwordVisible ? "text" : "password"}
                className={passwordError ? "is-invalid" : ""}
                placeholder="Contraseña"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <Button
                variant="outline-warning"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? "Ocultar" : "Mostrar"}
              </Button>
            </InputGroup>
             {passwordError && <Form.Control.Feedback type="invalid">Porfavor ponga un usuario y contraseña correctos.</Form.Control.Feedback>}
          </Form.Group>

          {error && <p className="text-danger">{error}</p>}

          <Button
            type="submit"
            variant="btn-zimenta"
            className="btn-block btn-zimenta"
          >
            Iniciar Sesión
          </Button>
        </Form>

        <div className="mt-3 text-center">
          <a href="#">Olvidé mi contraseña</a>
        </div>

        <p className="mt-3 text-center">
          By continuing, you agree to the{" "}
          <Link to="/terms-use">Terms of Use</Link> and{" "}
          <Link to="/privacy-policy">Privacy Policy</Link>
        </p>
      </Card.Body>
    </Card>
  </Container>
  );
}

export default LoginForm;
