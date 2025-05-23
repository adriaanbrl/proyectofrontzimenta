import React, { useState } from "react";
import "../../App.css";
import { Link, useNavigate } from "react-router-dom";
import { Container, Col, Card, Form, Button, InputGroup } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Importa la función para decodificar el token

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [error, setError] = useState("");
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
    setError("");

    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem("authToken", token);

        setUsernameError(false);
        setPasswordError(false);

        try {
          const decodedToken = jwtDecode(token);
          // Assuming the backend adds a 'userType' claim to the token
          // This claim will differentiate between 'customer' and 'worker'
          const userType = decodedToken.userType;
          const rolId = decodedToken.roleId; // This is typically for workers

          console.log("userType recibido del token (JWT):", userType);
          console.log("rolId recibido del token (JWT):", rolId);

          if (userType === "customer") {
            // If it's a customer, navigate directly to /inicio
            navigate("/inicio");
          } else if (userType === "worker") {
            // If it's a worker, check their specific rolId
            switch (rolId) {
              case 4: // Admin role for workers
                navigate("/admin");
                break;
              case 5: // Regular worker role
                navigate("/trabajador");
                break;
              default:
                // Fallback for unexpected worker roles, or if rolId is missing for a worker
                console.warn("Worker con rolId desconocido o no especificado:", rolId);
                navigate("/trabajador"); // Default navigation for workers
                break;
            }
          } else {
            // Handle cases where userType is neither 'customer' nor 'worker'
            console.error("Tipo de usuario desconocido en el token:", userType);
            setError("Tipo de usuario no reconocido. Contacta al soporte.");
            // Optionally clear token or force logout if userType is invalid
            localStorage.removeItem("authToken");
            navigate("/"); // Redirect to login or a generic error page
          }
        } catch (decodeError) {
          console.error("Error al decodificar el token:", decodeError);
          setError("Error interno al procesar la autenticación.");
        }
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
                {passwordError && (
                    <Form.Control.Feedback type="invalid">
                      Porfavor ponga un usuario y contraseña correctos.
                    </Form.Control.Feedback>
                )}
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
              By continuing, you agree to the <Link to="/terms-use">Terms of Use</Link> and{" "}
              <Link to="/privacy-policy">Privacy Policy</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
  );
}

export default LoginForm;
