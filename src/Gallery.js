import React, { useState } from "react";
import { Link } from "react-router-dom";

const galleries = {
  "LA MORALEJA": [
    "/img/Moraleja/1.jpg",
    "/img/Moraleja/2.jpg",
    "/img/Moraleja/3.jpg",
    "/img/Moraleja/4.jpg",
    "/img/Moraleja/5.jpg",
    "/img/Moraleja/6.jpg",
    "/img/Moraleja/7.jpg",
    "/img/Moraleja/8.jpg",
    "/img/Moraleja/9.jpg",
    "/img/Moraleja/10.jpg",
  ],
  CIUDALCAMPO: [
    "/img/CiudalCampo2/1.jpg",
    "/img/CiudalCampo2/2.jpg",
    "/img/CiudalCampo2/3.jpg",
    "/img/CiudalCampo2/4.jpg",
    "/img/CiudalCampo2/5.jpg",
    "/img/CiudalCampo2/6.jpg",
    "/img/CiudalCampo2/7.jpg",
    "/img/CiudalCampo2/8.jpg",
    "/img/CiudalCampo2/9.jpg",
    "/img/CiudalCampo2/10.jpg",
    "/img/CiudalCampo2/11.jpg",
  ],
  MADROÑOS: [
    "/img/Madroños/1.jpg",
    "/img/Madroños/2.jpg",
    "/img/Madroños/3.jpg",
    "/img/Madroños/4.jpg",
    "/img/Madroños/5.jpg",
    "/img/Madroños/6.jpg",
    "/img/Madroños/7.jpg",
  ],
  ARAVACA: [
    "/img/Aravaca2/1.jpg",
    "/img/Aravaca2/2.jpg",
    "/img/Aravaca2/3.jpg",
    "/img/Aravaca2/4.jpg",
    "/img/Aravaca2/5.jpg",
    "/img/Aravaca2/6.jpg",
    "/img/Aravaca2/7.jpg",
    "/img/Aravaca2/8.jpg",
    "/img/Aravaca2/9.jpg",
    "/img/Aravaca2/10.jpg",
  ],
};

function Gallery() {
  const [selectedGallery, setSelectedGallery] = useState(
    galleries["LA MORALEJA"]
  );

  const handleClick = (galleryName) => {
    setSelectedGallery(galleries[galleryName]);
  };

  return (
    <div className="container mt-4">
      <header className="text-center mt-5">
        <Link to="/">
          <img
            src="/img/logo_zimenta.png"
            alt="Logo"
            className="img-fluid"
            style={{ maxWidth: "150px", height: "auto" }}
          />
        </Link>
      </header>
      <div className="row mt-5">
        {/* Sidebar */}
        <div className="col-md-3 p-3 position-sticky" style={{ backgroundColor: "#f5922c" }}>
          <ul className="list-unstyled text-white">
            {Object.keys(galleries).map((galleryName) => (
              <li
                key={galleryName}
                onClick={() => handleClick(galleryName)}
                style={{ cursor: "pointer" }}
              >
                {galleryName}
              </li>
            ))}
          </ul>
        </div>

        {/* Galeria */}
        <div className="col-md-9">
          <div className="row g-2">
            {selectedGallery.map((src, index) => (
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
