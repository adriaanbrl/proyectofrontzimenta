// src/components/client/ClientView.js

import React from "react";
// CORRECTED LINE BELOW:
import { Container, Row, Col } from "react-bootstrap"; // Changed '=' to 'from'
import ClientData from "./ClientData";
import ClientOverview from "./ClientOverview";
import ProjectTimeline from "./ProjectTimeline";
import ProjectInfo from "./ProjectInfo";
import "./ClientView.css";

const ClientView = () => {
  const {
    loading,
    error,
    clientName,
    buildingAddress,
    formattedBuildingStartDate,
    formattedBuildingEndDate,
    estimatedPrice,
    invoiceAmount,
    pendingAmountValue,
    lastInvoice,
    timelineItems,
    fetchLastInvoice,
  } = ClientData();

  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return (
        <div>
          Error loading project data: {error.message}
        </div>
    );
  }

  return (
      <Container className="mt-4">
        <Row>
          <Col md={12}>
            <h2 className="text-start mb-4 text fw-bold">
              HOLA, {clientName || "Client"}:
            </h2>
          </Col>
        </Row>
        <Row>
          <ClientOverview
              estimatedPrice={estimatedPrice}
              paidAmount={invoiceAmount}
              pendingAmountValue={pendingAmountValue}
              lastInvoice={lastInvoice}
              fetchLastInvoice={fetchLastInvoice}
          />
        </Row>

        <Row className="mt-4">
          <ProjectTimeline timelineItems={timelineItems} />
        </Row>
        {/* ADD THIS CLASS: 'info-section-spacing' */}
        <Row className="mt-4 info-section-spacing">
          <ProjectInfo
              buildingAddress={buildingAddress}
              formattedBuildingStartDate={formattedBuildingStartDate}
              formattedBuildingEndDate={formattedBuildingEndDate}
          />
        </Row>
      </Container>
  );
};

export default ClientView;