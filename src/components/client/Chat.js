import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, InputGroup, Form, ListGroup } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons'; // Importa el icono de búsqueda si lo deseas

function Chat() {
    return (
        <Container className="mt-4">
            <InputGroup className="mb-3">
                <InputGroup.Text className="bg-light border-0" id="basic-addon1">
                    {/* Puedes usar un icono aquí si lo deseas */}
                    {/* <Search /> */}
                </InputGroup.Text>
                <Form.Control
                    type="text"
                    className="border-0 shadow-sm"
                    placeholder="Buscar"
                    aria-label="Buscar"
                    aria-describedby="basic-addon1"
                />
            </InputGroup>
            <h2 className="fs-6 text-uppercase text-secondary mb-3">Contactos Zimenta</h2>
            <ListGroup className="shadow-sm rounded">
                {/* Aquí irían los elementos de la lista de contactos */}
            </ListGroup>
        </Container>
    );
}

export default Chat;