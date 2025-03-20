import React from 'react';

function GlobalView() {
  return (
    <div className="container">
      {/* Logo más pequeño */}
      <header className="text-center mt-5">
        <img 
          src="/img/logo_zimenta.png" 
          alt="Logo" 
          className="img-fluid"
          style={{ maxWidth: '150px', height: 'auto' }} 
        />
      </header>

      {/* Carrusel con imágenes del mismo tamaño */}
      <div id="carouselExample" className="carousel slide mt-5" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img 
              src="/img/img1.jpg" 
              className="d-block w-100" 
              alt="First slide" 
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </div>
          <div className="carousel-item">
            <img 
              src="/img/img2.jpg" 
              className="d-block w-100" 
              alt="Second slide" 
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </div>
          <div className="carousel-item">
            <img 
              src="/img/img3.jpg" 
              className="d-block w-100" 
              alt="Third slide" 
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Sección inferior */}
      <section className="text-center mt-5">
        <p>Descripción de la página</p>
        <button className="btn btn-primary">Eres cliente</button>
      </section>
    </div>
  );
}

export default GlobalView;
