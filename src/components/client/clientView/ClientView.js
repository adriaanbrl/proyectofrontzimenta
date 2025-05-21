    // src/components/client/ClientView.js
    import React from "react";
    import { Container, Row, Col } from "react-bootstrap";
    import ClientData from "./ClientData";
    import ClientOverview from "./ClientOverview";
    import ProjectTimeline from "./ProjectTimeline";
    import ProjectInfo from "./ProjectInfo";
    import EstimatedPrice from "./EstimatedPrice"; // Importa el componente
    import "./ClientView.css";

    const ClientView = () => {
    const {
        loading,
        error,
        clientName,
        buildingAddress,
        formattedBuildingStartDate,
        formattedBuildingEndDate,
        budgetAmount, // Usa budgetAmount en lugar de estimatedPrice
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
            <h2 className="text-start mb-2 text fw-bold">
                HOLA, {clientName || "Client"}:
            </h2>
            
            </Col>
        </Row>
        <Row>
            <ClientOverview
            estimatedPrice={budgetAmount} // Usa budgetAmount aquí también
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