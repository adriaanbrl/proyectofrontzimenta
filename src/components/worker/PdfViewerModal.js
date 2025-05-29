import React from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';

const PdfViewerModal = ({ show, onHide, pdfUrl, isLoading, error }) => {
    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-secondary text-white py-3">
                <Modal.Title className="fw-bold fs-5">Visualizar PDF de Factura</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0" style={{ height: '80vh' }}>
                {isLoading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" />
                        <p className="mt-2">Cargando PDF...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="m-3 text-center">{error}</Alert>
                ) : pdfUrl ? (
                    <iframe src={pdfUrl} title="Invoice PDF" width="100%" height="100%" style={{ border: 'none' }}>
                        Tu navegador no soporta iframes, o el PDF no se pudo cargar. Puedes intentar descargar el archivo.
                    </iframe>
                ) : (
                    <div className="text-center my-5">
                        <p>Selecciona una factura para ver su PDF.</p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PdfViewerModal;