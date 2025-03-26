import React from "react";


const images = [
  "img1.jpg",
  "img2.jpg",
  "img3.jpg",
  "img4.jpg",
  "img5.jpg",
  "img6.jpg",
  "img7.jpg",
  "img8.jpg",
  "img9.jpg",
];

function Gallery() {
  return (
    <div className="container mt-4">
        <header className="text-center mt-5">
        <img
          src="/img/logo_zimenta.png"
          alt="Logo"
          className="img-fluid"
          style={{ maxWidth: "150px", height: "auto" }}
        />
      </header>
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 bg-warning p-3">
          <ul className="list-unstyled text-white">
            <li>LA MORALEJA 2</li>
            <li>CIUDALCAMPO 2</li>
            <li>MADROÑOS</li>
            <li>ARAVACA II</li>
            <li>BOADILLA</li>
            <li>CASA DEL CERRO</li>
            <li>CIUDALCAMPO</li>
          </ul>
        </div>

        {/* Main Gallery */}
        <div className="col-md-9">
          <div className="row g-2">
            {images.map((src, index) => (
              <div className="col-4" key={index}>
                <img
                  src={src}
                  alt={`Obra ${index + 1}`}
                  className="img-fluid rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
