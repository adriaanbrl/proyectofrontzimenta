import React from "react";
import "./App.css";

function GlobalView() {
  return (
    <div className="container">
      {/* Logo más pequeño */}
      <header className="text-center mt-5">
        <img
          src="/img/logo_zimenta.png"
          alt="Logo"
          className="img-fluid"
          style={{ maxWidth: "150px", height: "auto" }}
        />
      </header>

      {/* Carrusel con imágenes del mismo tamaño */}
      <div
        id="carouselExample"
        className="carousel slide mt-5 mb-5"
        data-bs-ride="carousel"
      >
        {/* Indicadores (círculos) sin números */}
        <ol className="carousel-indicators">
          <li
            data-bs-target="#carouselExample"
            data-bs-slide-to="0"
            className="active"
          ></li>
          <li data-bs-target="#carouselExample" data-bs-slide-to="1"></li>
          <li data-bs-target="#carouselExample" data-bs-slide-to="2"></li>
          <li data-bs-target="#carouselExample" data-bs-slide-to="3"></li>
          <li data-bs-target="#carouselExample" data-bs-slide-to="4"></li>
        </ol>

        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src="/img/img1.png"
              className="d-block w-100"
              alt="First slide"
              style={{
                height: "500px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
          <div className="carousel-item">
            <img
              src="/img/img2.jpg"
              className="d-block w-100"
              alt="Second slide"
              style={{
                height: "500px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
          <div className="carousel-item">
            <img
              src="/img/img3.png"
              className="d-block w-100"
              alt="Third slide"
              style={{
                height: "500px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
          <div className="carousel-item">
            <img
              src="/img/img4.png"
              className="d-block w-100"
              alt="Fourth slide"
              style={{
                height: "500px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
          <div className="carousel-item">
            <img
              src="/img/img5.png"
              className="d-block w-100"
              alt="Fifth slide"
              style={{
                height: "500px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>

        {/* Botones de navegación del carrusel */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* Descripcion */}
      <div className="row mt-5 align-items-center">
        <h2 className="modern-title mt-5">CONSTRUYENDO TU ESPACIO</h2>
        <div className="col-md-6">
          <img
            src="/img/casa3d.png"
            className="d-block w-100"
            alt="Second slide"
            style={{
              height: "500px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        </div>
        <div className="col-md-6">
          <p className="modern-text text-start">
            Zimenta es una empresa constructora especializada en edificación
            singular. Con nuestro trabajo diario aportamos ideas, soluciones y
            calidad, siempre desde el compromiso, la seriedad y un trato cercano
            y profesional, lo que constituye la clave del éxito de nuestra
            empresa.
          </p>
        </div>
      </div>

      {/* Certificados */}
      <div className="row mt-5 align-items-center">
        <h2 className="modern-title mt-5">CERTIFICACIÓN OFICIAL</h2>
        <div className="col-md-6">
          <p className="modern-text text-start">
            Aportamos valor añadido y exclusividad a todos nuestros trabajos.
            Estamos certificados con sellos de calidad y medio ambiente, y
            clasificados por el Ministerio de Fomento como contratistas con la
            Administración
          </p>
          <a
            href="https://www.appluscertification.com/global/es/about-us/applus-group"
            class="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Saber más
          </a>
        </div>
        <div className="col-md-3">
          <img
            src="/img/A9001.png"
            className="d-block w-100"
            alt="Second slide"
            style={{
              height: "500px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        </div>
        <div className="col-md-3">
          <img
            src="/img/A14001.png"
            className="d-block w-100"
            alt="Second slide"
            style={{
              height: "500px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        </div>
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
