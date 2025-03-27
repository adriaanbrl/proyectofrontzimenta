import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

const obraNueva = {
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
  "ARAVACA": [
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

const reformaRehabilitacion = {
  "Loft Aranjuez": [
    "/img/Loft Aranjuez/1.jpg",
    "/img/Loft Aranjuez/2.jpg",
    "/img/Loft Aranjuez/3.jpg",
    "/img/Loft Aranjuez/4.jpg",
    "/img/Loft Aranjuez/5.jpg",
    "/img/Loft Aranjuez/6.jpg",
    "/img/Loft Aranjuez/7.jpg",
    "/img/Loft Aranjuez/8.jpg",
    "/img/Loft Aranjuez/9.jpg",
    "/img/Loft Aranjuez/10.jpg",
    
  ],
  "Oficinas Madrid": [
    "/img/Oficinas Madrid/1.jpg",
    "/img/Oficinas Madrid/2.jpg",
    "/img/Oficinas Madrid/3.jpg",
    "/img/Oficinas Madrid/4.jpg",
    "/img/Oficinas Madrid/5.jpg",
    "/img/Oficinas Madrid/6.jpg",
    "/img/Oficinas Madrid/7.jpg",
    "/img/Oficinas Madrid/8.jpg",
    "/img/Oficinas Madrid/9.jpg",
    "/img/Oficinas Madrid/10.jpg",
    
  ],
  "Ayala": [
    "/img/Ayala/1.jpg",
    "/img/Ayala/2.jpg",
    "/img/Ayala/3.jpg",
    "/img/Ayala/4.jpg",
    "/img/Ayala/5.jpg",
    "/img/Ayala/6.jpg",
    "/img/Ayala/7.jpg",
    "/img/Ayala/8.jpg",
  ],
  "Chamberi": [
    "/img/Chamberi/1.jpg",
    "/img/Chamberi/2.jpg",
    "/img/Chamberi/3.jpg",
    "/img/Chamberi/4.jpg",
    "/img/Chamberi/5.jpg",
    "/img/Chamberi/6.jpg",
    "/img/Chamberi/7.jpg",
    "/img/Chamberi/8.jpg",
  ],
};

const comercialRetail = {
  "Ahorro Corporación": [
    "/img/Ahorrro Corporación/1.jpg",
    "/img/Ahorrro Corporación/2.jpg",
    "/img/Ahorrro Corporación/3.jpg",
    "/img/Ahorrro Corporación/4.jpg",
    "/img/Ahorrro Corporación/5.jpg",
    "/img/Ahorrro Corporación/6.jpg",
    "/img/Ahorrro Corporación/7.jpg",
    "/img/Ahorrro Corporación/8.jpg",
  ],
  "Bodegas Amador Garcia": [
    "/img/Bodegas Amador/1.jpg",
    "/img/Bodegas Amador/2.jpg",
    "/img/Bodegas Amador/3.jpg",
    "/img/Bodegas Amador/4.jpg",
    "/img/Bodegas Amador/5.jpg",
    "/img/Bodegas Amador/6.jpg",
    "/img/Bodegas Amador/7.jpg",
    "/img/Bodegas Amador/8.jpg",
  ],
  "Centro Comercial Arrecife": [
    "/img/Centro comercial arrecife/1.jpg",
    "/img/Centro comercial arrecife/2.jpg",
    "/img/Centro comercial arrecife/3.jpg",
    "/img/Centro comercial arrecife/4.jpg",
    "/img/Centro comercial arrecife/5.jpg",
    "/img/Centro comercial arrecife/6.jpg",
    "/img/Centro comercial arrecife/7.jpg",
  ],
  "Dry Martini": [
    "/img/Dry Martini/1.jpg",
    "/img/Dry Martini/2.jpg",
    "/img/Dry Martini/3.jpg",
    "/img/Dry Martini/4.jpg",
    "/img/Dry Martini/5.jpg",
    "/img/Dry Martini/6.jpg",
    "/img/Dry Martini/7.jpg",
    "/img/Dry Martini/8.jpg",
  ],
  
};

const allGalleries = {
  ...obraNueva,
  ...reformaRehabilitacion,
  ...comercialRetail,
};

function Gallery() {
  const { galleryName } = useParams();
  const [searchParams] = useSearchParams();
  const [selectedGallery, setSelectedGallery] = useState([]);
  const [filteredGalleries, setFilteredGalleries] = useState(allGalleries);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section === "reforma-rehabilitacion") {
      setFilteredGalleries(reformaRehabilitacion);
    } else if (section === "comercial-retail") {
      setFilteredGalleries(comercialRetail);
    } else if (section === "obra-nueva") {
      setFilteredGalleries(obraNueva);
    } else {
      setFilteredGalleries(allGalleries);
    }

    // Establecer la galería inicial si viene un nombre específico en la URL
    if (galleryName && allGalleries[galleryName?.toUpperCase()?.replace(/-/g, ' ')]) {
      setSelectedGallery(allGalleries[galleryName?.toUpperCase()?.replace(/-/g, ' ')]);
    } else {
      setSelectedGallery(allGalleries[Object.keys(allGalleries)[0]] || []);
    }
  }, [searchParams, galleryName]);

  const handleClick = (name) => {
    setSelectedGallery(allGalleries[name]);
    // Opcional: Actualizar la URL al hacer clic en la sidebar
    // navigate(`/gallery/${name.toLowerCase().replace(/ /g, '-')}`);
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
            {Object.keys(filteredGalleries).map((name) => (
              <li
                key={name}
                onClick={() => handleClick(name)}
                style={{ cursor: "pointer" }}
              >
                {name}
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