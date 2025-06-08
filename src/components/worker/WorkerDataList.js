import React, { useState } from "react";
import {
  Container,
  Card,
  Button,
  Accordion,
  Spinner,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import useWorkerData from "./hooks/UseWorkerData";
import EventDetailModal from "./EventDetailModal";
import InvoiceEditModal from "./InvoiceEditModal";
import InvoiceDeleteConfirmModal from "./InvoiceDeleteConfirmModal";
import PdfViewerModal from "./PdfViewerModal";
import LegalDocumentEditModal from "./LegalDocumentEditModal";
import LegalDocumentDeleteConfirmModal from "./LegalDocumentDeleteConfirmModal";
import EstanciasList from "./EstanciasList";
import CategoriasList from "./CategoriasList";
import BuildingImagesList from "./BuildingImagesList";
import BudgetDisplay from "./BudgetDisplay";

import EditManualModal from "./EditManualModal";
import DeleteManualModal from "./DeleteManualModal";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";
  return date.toLocaleDateString();
};

const WorkerDataList = () => {
  const {
    workerConstructions,
    loadingConstructions,
    errorConstructions,
    eventsByBuilding,
    loadingEvents,
    errorEvents,
    invoicesByBuilding,
    loadingInvoices,
    errorInvoices,
    legalDocumentsByBuilding,
    loadingLegalDocuments,
    errorLegalDocuments,
    manualsByBuilding,
    loadingManuals,
    errorManuals,
    currentPdfUrl,
    loadingPdf,
    pdfError,
    loadingInvoiceAction,
    invoiceActionError,
    loadingLegalDocAction,
    legalDocActionError,
    loadingManualAction,
    manualActionError,
    fetchEventsForBuilding,
    fetchInvoicesForBuilding,
    fetchLegalDocumentsForBuilding,
    fetchManualsForBuilding,
    handleViewPdf,
    handleInvoiceUpdate,
    handleInvoiceDelete,
    handleEventUpdate,
    handleEventDelete,
    handleLegalDocumentUpdate,
    handleLegalDocumentDelete,
    handleManualUpdate,
    handleManualDelete,
    handleClosePdfModal,
    setLoadingPdf,
    setPdfError,
    setLoadingInvoiceAction,
    setInvoiceActionError,
    setLoadingLegalDocAction,
    setLegalDocActionError,
    setLoadingManualAction,
    setManualActionError,
  } = useWorkerData();

  const [activeAccordionKey, setActiveAccordionKey] = useState(null);
  const [activeInnerAccordionKey, setActiveInnerAccordionKey] = useState({});
  const [activeAuxAccordionKey, setActiveAuxAccordionKey] = useState(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [currentInvoiceToEdit, setCurrentInvoiceToEdit] = useState(null);

  const [showDeleteInvoiceModal, setShowDeleteInvoiceModal] = useState(false);
  const [invoiceToDeleteId, setInvoiceToDeleteId] = useState(null);

  const [showEditLegalDocModal, setShowEditLegalDocModal] = useState(false);
  const [currentLegalDocToEdit, setCurrentLegalDocToEdit] = useState(null);

  const [showDeleteLegalDocModal, setShowDeleteLegalDocModal] = useState(false);
  const [legalDocToDeleteId, setLegalDocToDeleteId] = useState(null);

  const [showPdfModal, setShowPdfModal] = useState(false);

  const [showEditManualModal, setShowEditManualModal] = useState(false);
  const [currentManualToEdit, setCurrentManualToEdit] = useState(null);

  const [showDeleteManualModal, setShowDeleteManualModal] = useState(false);
  const [manualToDelete, setManualToDelete] = useState(null);

  const handleAccordionSelect = (eventKey) => {
    setActiveAccordionKey(eventKey);
    setActiveInnerAccordionKey({});
  };

  const handleInnerAccordionSelect = (buildingId, innerEventKey) => {
    setActiveInnerAccordionKey((prev) => ({
      ...prev,
      [buildingId]: prev[buildingId] === innerEventKey ? null : innerEventKey,
    }));

    if (innerEventKey === "events-section") {
      if (
          !eventsByBuilding[buildingId] ||
          eventsByBuilding[buildingId].length === 0 ||
          errorEvents[buildingId]
      ) {
        fetchEventsForBuilding(buildingId);
      }
    } else if (innerEventKey === "invoices-section") {
      if (
          !invoicesByBuilding[buildingId] ||
          invoicesByBuilding[buildingId].length === 0 ||
          errorInvoices[buildingId]
      ) {
        fetchInvoicesForBuilding(buildingId);
      }
    } else if (innerEventKey === "legal-documentation-section") {
      if (
          !legalDocumentsByBuilding[buildingId] ||
          legalDocumentsByBuilding[buildingId].length === 0 ||
          errorLegalDocuments[buildingId]
      ) {
        fetchLegalDocumentsForBuilding(buildingId);
      }
    } else if (innerEventKey === "manuals-section") {
      if (
          !manualsByBuilding[buildingId] ||
          manualsByBuilding[buildingId].length === 0 ||
          errorManuals[buildingId]
      ) {
        fetchManualsForBuilding(buildingId);
      }
    }
  };

  const handleAuxAccordionSelect = (eventKey) => {
    setActiveAuxAccordionKey(
        activeAuxAccordionKey === eventKey ? null : eventKey
    );
  };

  const handleEditEvent = (event, buildingId) => {
    setCurrentEvent({ ...event, buildingId });
    setShowEventModal(true);
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setCurrentEvent(null);
  };

  const handleEventSaved = (updatedEvent) => {
    handleEventUpdate(updatedEvent);
    handleCloseEventModal();
  };

  const handleEventDeleted = (deletedEventId, buildingId) => {
    handleEventDelete(deletedEventId, buildingId);
    handleCloseEventModal();
  };

  const handleInvoiceEdit = (invoice) => {
    setCurrentInvoiceToEdit(invoice);
    setShowEditInvoiceModal(true);
    setInvoiceActionError(null);
  };

  const handleInvoiceEditSaved = (buildingId) => {
    handleInvoiceUpdate(buildingId);
    setShowEditInvoiceModal(false);
  };

  const handleInvoiceDeleteRequest = (invoiceId) => {
    setInvoiceToDeleteId(invoiceId);
    setShowDeleteInvoiceModal(true);
    setInvoiceActionError(null);
  };

  const handleInvoiceDeleteConfirmed = (deletedInvoiceId, buildingId) => {
    handleInvoiceDelete(deletedInvoiceId, buildingId);
    setShowDeleteInvoiceModal(false);
  };

  const handleLegalDocEdit = (document) => {
    setCurrentLegalDocToEdit(document);
    setShowEditLegalDocModal(true);
    setLegalDocActionError(null);
  };

  const handleLegalDocEditSaved = (buildingId) => {
    handleLegalDocumentUpdate(buildingId);
    setShowEditLegalDocModal(false);
  };

  const handleLegalDocDeleteRequest = (documentId, buildingId) => {
    setLegalDocToDeleteId(documentId);
    setShowDeleteLegalDocModal(true);
    setLegalDocActionError(null);
  };

  const handleLegalDocDeleteConfirmed = (deletedDocumentId, buildingId) => {
    handleLegalDocumentDelete(deletedDocumentId, buildingId);
    setShowDeleteLegalDocModal(false);
  };

  const handlePdfViewerOpen = async (documentType, id) => {
    await handleViewPdf(documentType, id);
    setShowPdfModal(true);
  };

  const handlePdfViewerClose = () => {
    handleClosePdfModal();
    setShowPdfModal(false);
  };

  const handleManualEdit = (manual) => {
    setCurrentManualToEdit(manual);
    setShowEditManualModal(true);
    setManualActionError(null);
  };

  const handleManualEditSaved = (buildingId) => {
    handleManualUpdate(buildingId);
    setShowEditManualModal(false);
  };

  const handleManualDeleteRequest = (manual) => {
    setManualToDelete(manual);
    setShowDeleteManualModal(true);
    setManualActionError(null);
  };

  const handleManualDeleteConfirmed = (deletedManualId, buildingId) => {
    handleManualDelete(deletedManualId, buildingId);
    setShowDeleteManualModal(false);
  };

  return (
      <Container className="my-4 p-4 rounded shadow-lg bg-light">
        <h4 className="mb-4 text-center text-custom">
          GESTIÓN DE EVENTOS, FACTURAS Y DOCUMENTACIÓN LEGAL POR CONSTRUCCIÓN:
        </h4>

        {loadingConstructions ? (
            <div className="text-center my-5">
              <Spinner animation="border" />
              <p className="mt-2">Cargando construcciones...</p>
            </div>
        ) : errorConstructions ? (
            <Alert variant="danger">{errorConstructions}</Alert>
        ) : workerConstructions.length > 0 ? (
            <Accordion
                activeKey={activeAccordionKey}
                onSelect={handleAccordionSelect}
            >
              {workerConstructions.map((construction, index) => (
                  <Card key={construction.id} className="mb-3 shadow-sm">
                    <Accordion.Item eventKey={index.toString()}>
                      <Accordion.Header>
                        <strong>{construction.title || construction.address}</strong>
                        <span className="ms-2 text-muted">({construction.id})</span>
                      </Accordion.Header>
                      <Accordion.Body>
                        <Accordion
                            activeKey={activeInnerAccordionKey[construction.id]}
                            onSelect={(key) =>
                                handleInnerAccordionSelect(construction.id, key)
                            }
                        >
                          <Accordion.Item eventKey="events-section">
                            <Accordion.Header>Eventos</Accordion.Header>
                            <Accordion.Body>
                              {loadingEvents[construction.id] ? (
                                  <div className="text-left my-3">
                                    <Spinner animation="border" size="sm" /> Cargando
                                    eventos...
                                  </div>
                              ) : errorEvents[construction.id] ? (
                                  <Alert variant="danger">
                                    {errorEvents[construction.id]}
                                  </Alert>
                              ) : (
                                  <>
                                    {eventsByBuilding[construction.id] &&
                                    eventsByBuilding[construction.id].length > 0 ? (
                                        eventsByBuilding[construction.id].map((event) => (
                                            <Card
                                                key={event.id}
                                                className="mb-2 p-2 shadow-sm"
                                            >
                                              <Card.Body className="d-flex justify-content-between py-2">
                                                <div>
                                                  <h6 className="text-start mb-1">{event.title}</h6>
                                                  <p className="mb-0 text-muted small">
                                                    {event.description}
                                                  </p>
                                                  <p className="text-start mb-0 text-muted small">
                                                    Fecha: {formatDate(event.date)}
                                                  </p>
                                                </div>
                                                <div>
                                                  <Button
                                                      variant="outline-primary"
                                                      size="sm"
                                                      className="me-2"
                                                      onClick={() =>
                                                          handleEditEvent(
                                                              event,
                                                              construction.id
                                                          )
                                                      }
                                                  >
                                                    ✏️ Editar
                                                  </Button>
                                                </div>
                                              </Card.Body>
                                            </Card>
                                        ))
                                    ) : (
                                        <Alert variant="info">
                                          No hay eventos registrados para esta
                                          construcción.
                                        </Alert>
                                    )}
                                  </>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>

                          <Accordion.Item eventKey="invoices-section">
                            <Accordion.Header>Facturas</Accordion.Header>
                            <Accordion.Body>
                              {loadingInvoices[construction.id] ? (
                                  <div className="text-center my-3">
                                    <Spinner animation="border" size="sm" /> Cargando
                                    facturas...
                                  </div>
                              ) : errorInvoices[construction.id] ? (
                                  <Alert variant="danger">
                                    {errorInvoices[construction.id]}
                                  </Alert>
                              ) : (
                                  <>
                                    {invoicesByBuilding[construction.id] &&
                                    invoicesByBuilding[construction.id].length > 0 ? (
                                        invoicesByBuilding[construction.id].map(
                                            (invoice) => (
                                                <Card
                                                    key={invoice.id}
                                                    className="mb-2 p-2 shadow-sm"
                                                >
                                                  <Card.Body className="d-flex justify-content-between align-items-center py-2">
                                                    <div>
                                                      <h6 className="mb-1">
                                                        Factura{" "}
                                                        {invoice.title &&
                                                            ` - ${invoice.title}`}
                                                      </h6>
                                                      <p className="mb-0 text-muted small">
                                                        Monto: $
                                                        {invoice.amount
                                                            ? invoice.amount.toFixed(2)
                                                            : "0.00"}
                                                      </p>
                                                      <p className="mb-0 text-muted small">
                                                        Fecha: {formatDate(invoice.date)}
                                                      </p>
                                                    </div>
                                                    <div className="d-flex flex-column flex-md-row">
                                                      <Button
                                                          variant="outline-info"
                                                          size="sm"
                                                          className="mb-2 mb-md-0 me-md-2"
                                                          onClick={() =>
                                                              handlePdfViewerOpen(
                                                                  "invoice",
                                                                  invoice.id
                                                              )
                                                          }
                                                          disabled={loadingPdf}
                                                      >
                                                        {loadingPdf ? (
                                                            <Spinner
                                                                animation="border"
                                                                size="sm"
                                                            />
                                                        ) : (
                                                            "📄 Ver PDF"
                                                        )}
                                                      </Button>
                                                      <Button
                                                          variant="outline-primary"
                                                          size="sm"
                                                          className="mb-2 mb-md-0 me-md-2"
                                                          onClick={() =>
                                                              handleInvoiceEdit(invoice)
                                                          }
                                                          disabled={loadingInvoiceAction}
                                                      >
                                                        {loadingInvoiceAction ? (
                                                            <Spinner
                                                                animation="border"
                                                                size="sm"
                                                            />
                                                        ) : (
                                                            "✏️ Editar"
                                                        )}
                                                      </Button>
                                                      <Button
                                                          variant="outline-danger"
                                                          size="sm"
                                                          onClick={() =>
                                                              handleInvoiceDeleteRequest(
                                                                  invoice.id
                                                              )
                                                          }
                                                          disabled={loadingInvoiceAction}
                                                      >
                                                        {loadingInvoiceAction ? (
                                                            <Spinner
                                                                animation="border"
                                                                size="sm"
                                                            />
                                                        ) : (
                                                            "🗑️ Borrar"
                                                        )}
                                                      </Button>
                                                    </div>
                                                  </Card.Body>
                                                </Card>
                                            )
                                        )
                                    ) : (
                                        <Alert variant="info">
                                          No hay facturas registradas para esta
                                          construcción.
                                        </Alert>
                                    )}
                                  </>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>

                          <Accordion.Item eventKey="legal-documentation-section">
                            <Accordion.Header>Documentación Legal</Accordion.Header>
                            <Accordion.Body>
                              {loadingLegalDocuments[construction.id] ? (
                                  <div className="text-center my-3">
                                    <Spinner animation="border" size="sm" /> Cargando
                                    documentos legales...
                                  </div>
                              ) : errorLegalDocuments[construction.id] ? (
                                  <Alert variant="danger">
                                    {errorLegalDocuments[construction.id]}
                                  </Alert>
                              ) : (
                                  <>
                                    {legalDocumentsByBuilding[construction.id] &&
                                    legalDocumentsByBuilding[construction.id].length >
                                    0 ? (
                                        legalDocumentsByBuilding[construction.id].map(
                                            (doc) => (
                                                <Card
                                                    key={doc.id}
                                                    className="mb-2 p-2 shadow-sm"
                                                >
                                                  <Card.Body className="d-flex justify-content-between align-items-center py-2">
                                                    <div>
                                                      <h6 className="mb-1">{doc.title}</h6>
                                                    </div>
                                                    <div className="d-flex flex-column flex-md-row">
                                                      <Button
                                                          variant="outline-info"
                                                          size="sm"
                                                          className="mb-2 mb-md-0 me-md-2"
                                                          onClick={() =>
                                                              handlePdfViewerOpen(
                                                                  "legal_documentation",
                                                                  doc.id
                                                              )
                                                          }
                                                          disabled={loadingPdf}
                                                      >
                                                        {loadingPdf ? (
                                                            <Spinner
                                                                animation="border"
                                                                size="sm"
                                                            />
                                                        ) : (
                                                            "📄 Ver PDF"
                                                        )}
                                                      </Button>
                                                      <Button
                                                          variant="outline-primary"
                                                          size="sm"
                                                          className="mb-2 mb-md-0 me-md-2"
                                                          onClick={() =>
                                                              handleLegalDocEdit(doc)
                                                          }
                                                          disabled={loadingLegalDocAction}
                                                      >
                                                        {loadingLegalDocAction ? (
                                                            <Spinner
                                                                animation="border"
                                                                size="sm"
                                                            />
                                                        ) : (
                                                            "✏️ Editar"
                                                        )}
                                                      </Button>
                                                      <Button
                                                          variant="outline-danger"
                                                          size="sm"
                                                          onClick={() =>
                                                              handleLegalDocDeleteRequest(
                                                                  doc.id,
                                                                  doc.building_id
                                                              )
                                                          }
                                                          disabled={loadingLegalDocAction}
                                                      >
                                                        {loadingLegalDocAction ? (
                                                            <Spinner
                                                                animation="border"
                                                                size="sm"
                                                            />
                                                        ) : (
                                                            "🗑️ Borrar"
                                                        )}
                                                      </Button>
                                                    </div>
                                                  </Card.Body>
                                                </Card>
                                            )
                                        )
                                    ) : (
                                        <Alert variant="info">
                                          No hay documentos legales registrados para esta
                                          construcción.
                                        </Alert>
                                    )}
                                  </>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>

                          <Accordion.Item eventKey="manuals-section">
                            <Accordion.Header>Manuales de Usuario</Accordion.Header>
                            <Accordion.Body>
                              {loadingManuals[construction.id] ? (
                                  <div className="text-center my-3">
                                    <Spinner animation="border" size="sm" /> Cargando
                                    manuales...
                                  </div>
                              ) : errorManuals[construction.id] ? (
                                  <Alert variant="danger">
                                    {errorManuals[construction.id]}
                                  </Alert>
                              ) : (
                                  <>
                                    {manualsByBuilding[construction.id] &&
                                    manualsByBuilding[construction.id].length > 0 ? (
                                        manualsByBuilding[construction.id].map(
                                            (manual) => (
                                                <Card
                                                    key={manual.id}
                                                    className="mb-2 p-2 shadow-sm"
                                                >
                                                  <Card.Body className="d-flex justify-content-between align-items-center py-2">
                                                    <div>
                                                      {/* !!! CAMBIO AQUÍ: Usar manual.displayTitle !!! */}
                                                      <h6 className="mb-1">{manual.displayTitle}</h6>
                                                    </div>
                                                    <div className="d-flex flex-column flex-md-row">
                                                      <Button
                                                          variant="outline-info"
                                                          size="sm"
                                                          className="mb-2 mb-md-0 me-md-2"
                                                          onClick={() =>
                                                              handlePdfViewerOpen(
                                                                  "user_manual",
                                                                  manual.id
                                                              )
                                                          }
                                                          disabled={loadingPdf}
                                                      >
                                                        {loadingPdf ? (
                                                            <Spinner
                                                                animation="border"
                                                                size="sm"
                                                            />
                                                        ) : (
                                                            "📄 Ver PDF"
                                                        )}
                                                      </Button>
                                                      <Button
                                                          variant="outline-primary"
                                                          size="sm"
                                                          className="mb-2 mb-md-0 me-md-2"
                                                          onClick={() =>
                                                              handleManualEdit(manual)
                                                          }
                                                          disabled={loadingManualAction}
                                                      >
                                                        {loadingManualAction ? (
                                                            <Spinner
                                                                animation="border"
                                                                size="sm"
                                                            />
                                                        ) : (
                                                            "✏️ Editar"
                                                        )}
                                                      </Button>
                                                      <Button
                                                          variant="outline-danger"
                                                          size="sm"
                                                          onClick={() =>
                                                              handleManualDeleteRequest(
                                                                  manual
                                                              )
                                                          }
                                                          disabled={loadingManualAction}
                                                      >
                                                        {loadingManualAction ? (
                                                            <Spinner
                                                                animation="border"
                                                                size="sm"
                                                            />
                                                        ) : (
                                                            "🗑️ Borrar"
                                                        )}
                                                      </Button>
                                                    </div>
                                                  </Card.Body>
                                                </Card>
                                            )
                                        )
                                    ) : (
                                        <Alert variant="info">
                                          No hay manuales de usuario registrados para esta
                                          construcción.
                                        </Alert>
                                    )}
                                  </>
                              )}
                            </Accordion.Body>
                          </Accordion.Item>


                          <Accordion.Item eventKey="images-section">
                            <Accordion.Header>Imágenes</Accordion.Header>
                            <Accordion.Body>
                              <BuildingImagesList buildingId={construction.id} />
                            </Accordion.Body>
                          </Accordion.Item>

                          <Accordion.Item eventKey="budget-section">
                            <Accordion.Header>Presupuesto</Accordion.Header>
                            <Accordion.Body>
                              <BudgetDisplay buildingId={construction.id} />
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Card>
              ))}
            </Accordion>
        ) : (
            <Alert variant="info">
              No hay construcciones asociadas a este trabajador.
            </Alert>
        )}

        <h4 className="mb-4 mt-5 text-center text-custom">
          GESTIÓN DE ESTANCIAS Y CATEGORÍAS:
        </h4>
        <Accordion
            activeKey={activeAuxAccordionKey}
            onSelect={handleAuxAccordionSelect}
            className="mt-4"
        >
          <Card className="mb-3 shadow-sm">
            <Accordion.Item eventKey="estancias-section">
              <Accordion.Header>Estancias</Accordion.Header>
              <Accordion.Body>
                <EstanciasList />
              </Accordion.Body>
            </Accordion.Item>
          </Card>

          <Card className="mb-3 shadow-sm">
            <Accordion.Item eventKey="categorias-section">
              <Accordion.Header>Categorías</Accordion.Header>
              <Accordion.Body>
                <CategoriasList />
              </Accordion.Body>
            </Accordion.Item>
          </Card>
        </Accordion>

        {currentEvent && (
            <EventDetailModal
                show={showEventModal}
                onHide={handleCloseEventModal}
                eventData={currentEvent}
                onSave={handleEventSaved}
                onDelete={handleEventDeleted}
            />
        )}

        <PdfViewerModal
            show={showPdfModal}
            onHide={handlePdfViewerClose}
            pdfUrl={currentPdfUrl}
            isLoading={loadingPdf}
            error={pdfError}
        />

        {currentInvoiceToEdit && (
            <InvoiceEditModal
                show={showEditInvoiceModal}
                onHide={() => setShowEditInvoiceModal(false)}
                invoiceData={currentInvoiceToEdit}
                onSave={handleInvoiceEditSaved}
                isLoading={loadingInvoiceAction}
                error={invoiceActionError}
                setLoading={setLoadingInvoiceAction}
                setError={setInvoiceActionError}
            />
        )}

        <InvoiceDeleteConfirmModal
            show={showDeleteInvoiceModal}
            onHide={() => setShowDeleteInvoiceModal(false)}
            invoiceId={invoiceToDeleteId}
            onDeleteConfirm={handleInvoiceDeleteConfirmed}
            isLoading={loadingInvoiceAction}
            error={invoiceActionError}
            setLoading={setLoadingInvoiceAction}
            setError={setInvoiceActionError}
        />

        {currentLegalDocToEdit && (
            <LegalDocumentEditModal
                show={showEditLegalDocModal}
                onHide={() => setShowEditLegalDocModal(false)}
                documentData={currentLegalDocToEdit}
                onSave={handleLegalDocEditSaved}
                isLoading={loadingLegalDocAction}
                error={legalDocActionError}
                setLoading={setLoadingLegalDocAction}
                setError={setLegalDocActionError}
            />
        )}

        <LegalDocumentDeleteConfirmModal
            show={showDeleteLegalDocModal}
            onHide={() => setShowDeleteLegalDocModal(false)}
            documentId={legalDocToDeleteId}
            buildingId={currentLegalDocToEdit?.building_id}
            onDeleteConfirm={handleLegalDocDeleteConfirmed}
            isLoading={loadingLegalDocAction}
            error={legalDocActionError}
            setLoading={setLoadingLegalDocAction}
            setError={setLegalDocActionError}
        />

        {currentManualToEdit && (
            <EditManualModal
                show={showEditManualModal}
                onHide={() => setShowEditManualModal(false)}
                manual={currentManualToEdit}
                onEditSuccess={() => handleManualEditSaved(currentManualToEdit.building_id)}
            />
        )}

        {manualToDelete && (
            <DeleteManualModal
                show={showDeleteManualModal}
                onHide={() => setShowDeleteManualModal(false)}
                manual={manualToDelete}
                onDeleteSuccess={() => handleManualDeleteConfirmed(manualToDelete.id, manualToDelete.building_id)}
            />
        )}
      </Container>
  );
};

export default WorkerDataList;
