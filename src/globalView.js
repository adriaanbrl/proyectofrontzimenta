import React from "react";
import "./App.css";
import { Link } from "react-router-dom";

function GlobalView() {
  return (
    <div className="container-fluid">
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
            class="btn-zimenta text-decoration-none  mb-5"
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
              height: "200px",
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
              height: "200px",
              objectFit: "cover",
              borderRadius: "10px",
            }}
          />
        </div>
      </div>

      {/* ImagenSeparadora */}
      <div className="w-100 mt-5">
        <img
          src="/img/separador.jpg"
          className="img-fluid w-100"
          alt="Imagen Intermedia"
          style={{
            height: "800px",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Especialidades */}
      <div
        className="row  align-items-center especialidades-section"
        id="gallery-links"
      >
        <h2 className="modern-title mt-5 text-white">NUESTROS ESPACIOS</h2>
        <div className="col-md-12">
          <p className="modern-text text-start text-white">
            Zimenta se ha especializado en la ejecución de edificaciones
            singulares, reformas y rehabilitaciones de espacios con encanto, así
            como ejecución de obras comerciales.
          </p>
        </div>

        {/* Imagen 1 */}
        <div className="col-md-4 col-sm-4">
          <Link to="/gallery?section=obra-nueva">
            <img
              src="/img/esp1.jpg"
              className="d-block w-100"
              alt="Imagen 1"
              style={{
                height: "700px",
                objectFit: "cover",
              }}
            />
          </Link>
          <p className="text-white">OBRA NUEVA</p>
        </div>

        {/* Imagen 2 */}
        <div className="col-md-4  col-sm-4">
          <Link to="/gallery?section=reforma-rehabilitacion">
            <img
              src="/img/esp2.jpg" // Cambia por la imagen correspondiente
              className="d-block w-100"
              alt="Imagen 2"
              style={{
                height: "700px",
                objectFit: "cover",
              }}
            />
          </Link>
          <p className="text-white">REFORMA Y REHABILITACIÓN</p>
        </div>

        {/* Imagen 3 */}
        <div className="col-md-4  col-sm-4">
          <Link to="/gallery?section=comercial-retail">
            <img
              src="/img/esp3.jpg" // Cambia por la imagen correspondiente
              className="d-block w-100"
              alt="Imagen 3"
              style={{
                height: "700px",
                objectFit: "cover",
              }}
            />
          </Link>
          <p className="text-white">COMERCIAL-RETAIL</p>
        </div>
      </div>

      {/* 2 Columnas Imagenes con Texto */}
      <div className="row align-items-center mt-5 g-4">
        {/* Columna 1 */}
        <div className="col-md-6">
          {/* Imagen 1 */}
          <img
            src="/img/collage1.jpg"
            className="img-fluid w-100"
            alt="Imagen 1"
            style={{ height: "700px", objectFit: "cover" }}
          />

          <div className="p-5">
            <h2 className="modern-title mt-5 text-start">
              CLIENTES Y SIN EMBARGO AMIGOS
            </h2>
            <p className="modern-text text-start">
              Desde nuestros orígenes, nuestro objetivo es trabajar con
              profesionalidad y al mismo tiempo mantener una estrecha relación
              con nuestros clientes. Un objetivo que conseguimos gracias a un
              servicio de calidad basado en la transparencia, con precios
              ajustados y un riguroso compromiso con los plazos de ejecución
              acordados.
            </p>
          </div>
        </div>

        {/* Columna 2 */}
        <div className="col-md-6">
          <div className="p-5">
            <h2 className="modern-title mt-5 text-start">
              MOTIVACIÓN Y EXPERIENCIA IMPULSANDO EL APRENDIZAJE Y LA INNOVACIÓN
            </h2>
            <p className="modern-text text-start mb-4">
              Somos un equipo humano joven, cohesionado y motivado,
              convenientemente formado y con una amplia experiencia que nos
              permite acometer el mejor servicio.
            </p>
          </div>
          <div className="row">
            {/* Imagen 2 */}
            <div className="col-12">
              <img
                src="/img/collage2.jpg"
                className="img-fluid w-100"
                alt="Imagen 2"
                style={{ height: "400px", objectFit: "cover" }}
              />
            </div>

            {/* Imagen 3 */}
            <div className="col-6 mt-4">
              <img
                src="/img/collage3.jpg"
                className="img-fluid w-100"
                alt="Imagen 3"
                style={{ height: "500px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección inferior */}
      <section className="text-center bg-dark text-white py-5 mt-5 mb-4">
        <div className="container">
          <h2 className="display-4 fw-bold">
            ¡Únete a la experiencia Zimenta!
          </h2>
          <p className="fs-5 mt-3">
            Descubre el mejor servicio en construcción de lujo con un
            seguimiento exclusivo de tu proyecto.
          </p>

          <Link to="/login" className="text-decoration-none">
            <button className=" btn-zimenta btn-lg mt-4 px-5 shadow-lg">
              Eres Cliente
            </button>
          </Link>
        </div>
      </section>

      {/* Fila con tres videos de Instagram con más márgenes */}
      <div className="row mt-5 p-5">
        {/* Video 1 */}
        <div className="col-4 mb-4">
          <iframe
            src="https://www.instagram.com/reel/C4PzRX2teBA/embed"
            width="100%"
            height="500"
            allowFullScreen
            className="border rounded"
            title="Video de Instagram 1"
            style={{ maxWidth: "100%" }}
          ></iframe>
        </div>

        {/* Video 2 */}
        <div className="col-4 mb-4">
          <iframe
            src="https://www.instagram.com/reel/C4GF6e8gZg2/embed"
            width="100%"
            height="500"
            allowFullScreen
            className="border rounded"
            title="Video de Instagram 2"
            style={{ maxWidth: "100%" }}
          ></iframe>
        </div>

        {/* Video 3 */}
        <div className="col-4 mb-4">
          <iframe
            src="https://www.instagram.com/reel/C37E8TyAgYb/embed"
            width="100%"
            height="500"
            allowFullScreen
            className="border rounded"
            title="Video de Instagram 3"
            style={{ maxWidth: "100%" }}
          ></iframe>
        </div>
      </div>

      {/* Footer */}
      <div className="especialidades-section mt-5 w-100">
        <div className="text-center text-white">
          <h3 className="fw-light text-uppercase">
            Con el lema de aprovechar al máximo todos los materiales
          </h3>
          <h1 className="fw-bold display-3 mt-3">ZIMENTA</h1>
          <p className="mt-3">
            ZIMENTA OBRAS Y PROYECTOS, S.L. <br />
            C/ PALMERAS 4 - NAVE A6. POL. IND. LA SENDILLA - 28350, CIEMPOZUELOS
            (MADRID) <br />
            918093601 · 918093579 <br />
            <a href="mailto:info@zimenta.com" className="text-white fw-bold">
              info@zimenta.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default GlobalView;
