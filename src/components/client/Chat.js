import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


function Chat() {
  return (
    <div className="container mt-4">
      <div className="input-group mb-3">
        <span className="input-group-text bg-light border-0" id="basic-addon1">
        </span>
        <input
          type="text"
          className="form-control border-0 shadow-sm"
          placeholder="Buscar"
          aria-label="Buscar"
          aria-describedby="basic-addon1"
        />
      </div>
      <h2 className="fs-6 text-uppercase text-secondary mb-3">Contactos Zimenta</h2>
      <ul className="list-group shadow-sm rounded">
      
      </ul>
    </div>
  );
}

export default Chat;