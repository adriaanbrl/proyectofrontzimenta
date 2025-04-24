import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image, Modal } from "react-bootstrap";
import { Link, useParams, useSearchParams } from "react-router-dom";

//Objeto que contiene las rutas de las imágenes para las galerías
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
  Ayala: [
    "/img/Ayala/1.jpg",
    "/img/Ayala/2.jpg",
    "/img/Ayala/3.jpg",
    "/img/Ayala/4.jpg",
    "/img/Ayala/5.jpg",
    "/img/Ayala/6.jpg",
    "/img/Ayala/7.jpg",
    "/img/Ayala/8.jpg",
  ],
  Chamberi: [
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

//Combina todos los objetos de galería en uno solo para facilitar el acceso.
const allGalleries = {
  ...obraNueva,
  ...reformaRehabilitacion,
  ...comercialRetail,
};

function Gallery() {
  const { galleryName } = useParams(); // Obtiene el nombre de la galería desde los parámetros de la URL.
  const [searchParams] = useSearchParams(); // Obtiene los parámetros de búsqueda de la URL.
  const [selectedGallery, setSelectedGallery] = useState([]); // Estado para almacenar la galería de imágenes actualmente seleccionada. Inicialmente vacío.
  const [filteredGalleries, setFilteredGalleries] = useState(allGalleries); // Estado para almacenar las galerías que se mostrarán en la barra lateral por filtro.
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar la visibilidad del modal de la imagen grande. Inicialmente oculto.
  const [selectedImage, setSelectedImage] = useState(null); // Estado para almacenar la URL de la imagen seleccionada para mostrar en el modal. Inicialmente nulo.

  useEffect(() => {
    // Obtiene el valor del parámetro 'section' de la URL. Filtra las galerías según el valor del parámetro 'section'.
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

    // Establece la galería inicial basada en el 'galleryName' de la URL.
    // Se convierte el 'galleryName' a mayúsculas y se reemplazan los guiones por espacios para que coincida con las claves del objeto 'allGalleries'.
    if (
        galleryName &&
        allGalleries[galleryName?.toUpperCase()?.replace(/-/g, " ")]
    ) {
      setSelectedGallery(
          allGalleries[galleryName?.toUpperCase()?.replace(/-/g, " ")]
      );
    } else {
      setSelectedGallery(allGalleries[Object.keys(allGalleries)[0]] || []);
    }
  }, [searchParams, galleryName]);

  // Función que se ejecuta al hacer clic en el nombre de una galería en la barra lateral.
  // Actualiza el estado 'selectedGallery' con las imágenes de la galería seleccionada.
  const handleClick = (name) => {
    setSelectedGallery(allGalleries[name]);
  };

  // Función que se ejecuta al hacer clic en una imagen de la galería.
  // Establece la URL de la imagen seleccionada y muestra el modal.
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  // Función para cerrar el modal de la imagen grande. Oculta el modal y resetea la URL de la imagen seleccionada.
  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  return (
      <Container className="mt-5">
        <header className="text-center mb-4">
          <Link to="/#gallery-links">
            <Image
                src="/img/logo_zimenta.png"
                alt="Logo"
                fluid
                style={{ maxWidth: "150px", height: "auto" }}
            />
          </Link>
        </header>
        <Row>
          {/* Sidebar */}
          <Col
              md={3}
              className="p-3" // Elimina position-sticky para que no se quede fijo
              style={{
                backgroundColor: "#f5922c",
                borderRadius: "10px",
                padding: "20px",
                // top: "20px", // Ya no es necesario
              }}
          >
            <ul className="list-unstyled text-white fs-5">
              {Object.keys(filteredGalleries).map((name) => (
                  <li
                      key={name}
                      onClick={() => handleClick(name)}
                      style={{
                        cursor: "pointer",
                        padding: "10px",
                        borderRadius: "8px",
                        transition: "background-color 0.3s",
                      }}
                      className="hover-effect"
                  >
                    {name}
                  </li>
              ))}
            </ul>
          </Col>

          {/* Galeria */}
          <Col md={9} className="mt-md-0 mt-4">
            <Row className="g-4">
              {selectedGallery.map((src, index) => (
                  <Col xs={12} sm={6} md={4} lg={3} key={index}>
                    <Image
                        src={src}
                        alt={`Obra ${index + 1}`}
                        fluid
                        rounded
                        style={{ cursor: "pointer" }}
                        onClick={() => handleImageClick(src)}
                    />
                  </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Modal */}
        <Modal
            show={modalVisible}
            onHide={closeModal}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            centered
            size="lg"
        >
          <Modal.Header closeButton />
          <Modal.Body className="d-flex justify-content-center">
            <Image src={selectedImage} alt="Imagen grande" fluid />
          </Modal.Body>
        </Modal>
      </Container>
  );
}

export default Gallery;