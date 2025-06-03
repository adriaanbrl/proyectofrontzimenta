 import React from "react";
    import { Container, Row, Col } from "react-bootstrap";
    import ClientData from "./ClientData";
    import ClientOverview from "./ClientOverview";
    import ProjectTimeline from "./ProjectTimeline";
    import ProjectInfo from "./ProjectInfo";
    import EstimatedPrice from "./EstimatedPrice";
    import "./ClientView.css";

    const ClientView = () => {
    const {
        loading,
        error,
        clientName,
        buildingAddress,
        formattedBuildingStartDate,
        formattedBuildingEndDate,
        budgetAmount,
        invoiceAmount,
        pendingAmountValue,
        lastInvoice,
        timelineItems,
        buildingId,
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
        <Row className="mb-2">
            <Col md={12}>
            <h2 className="text-start mb-2 text fw-bold">
                HOLA, {clientName || "Client"}:
            </h2>
            
            </Col>
        </Row>
        <Row>
            <ClientOverview
            estimatedPrice={budgetAmount}
            paidAmount={invoiceAmount}
            pendingAmountValue={pendingAmountValue}
            lastInvoice={lastInvoice}
            fetchLastInvoice={fetchLastInvoice}
            buildingId={buildingId}
            />
        </Row>

        <Row className="mt-4">
            <ProjectTimeline timelineItems={timelineItems} />
        </Row>
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