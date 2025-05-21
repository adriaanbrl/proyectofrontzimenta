import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const ClientData = () => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buildingId, setBuildingId] = useState("");
  const [clientName, setClientName] = useState("");
  const [buildingAddress, setBuildingAddress] = useState("");
  const [buildingStartDate, setBuildingStartDate] = useState("");
  const [buildingEndDate, setBuildingEndDate] = useState("");
  const [events, setEvents] = useState([]);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState(null);
  const [eventMonth, setEventMonth] = useState(new Date());
  const [budgetAmount, setBudgetAmount] = useState(null); // Puede ser null inicialmente
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState(0); // Ensure initial state is number
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [lastInvoiceLoading, setLastInvoiceLoading] = useState(false);
  const [lastInvoiceError, setLastInvoiceError] = useState(null);

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    try {
      const date = new Date(dateString);
      return date
        .toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        .replace(/ de /g, " ");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha inválida";
    }
  };

  const fetchEvents = useCallback(async (buildingId, year, month) => {
    setEventLoading(true);
    setEventError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token de autenticación.");
      const response = await axios.get(
        `http://localhost:8080/auth/building/${buildingId}/events?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(response.data || []);
    } catch (err) {
      setEventError(err);
      setEvents([]);
    } finally {
      setEventLoading(false);
    }
  }, []);

  const fetchBudget = useCallback(async (buildingId) => {
    setBudgetLoading(true);
    setBudgetError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token de autenticación.");
      const response = await axios.get(
        `http://localhost:8080/api/budget/${buildingId}/budget`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Ensure the amount is a number, default to null if not present
      setBudgetAmount(response.data?.amount !== undefined ? Number(response.data.amount) : null);
    } catch (err) {
      setBudgetError(err);
      setBudgetAmount(null);
    } finally {
      setBudgetLoading(false);
    }
  }, []);

  const fetchInvoiceAmount = useCallback(async (buildingId) => {
    setInvoiceLoading(true);
    setInvoiceError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token de autenticación.");
      const response = await axios.get(
        `http://localhost:8080/api/invoices/building/${buildingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Ensure the amount is a number, default to 0 if not a valid number
      setInvoiceAmount(Number(response.data) || 0);
    } catch (err) {
      setInvoiceError(err);
      setInvoiceAmount(0);
    } finally {
      setInvoiceLoading(false);
    }
  }, []);

  const fetchLastInvoice = useCallback(async (buildingId) => {
    setLastInvoiceLoading(true);
    setLastInvoiceError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No se encontró el token de autenticación.");
      const response = await axios.get(
        `http://localhost:8080/api/invoices/last/${buildingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status !== 200) {
        throw new Error(
          `Error al obtener la última factura: ${response.status}`
        );
      }
      setLastInvoice(response.data || null);
    } catch (err) {
      console.error("Error fetching last invoice:", err);
      setLastInvoiceError(err);
      setLastInvoice(null);
    } finally {
      setLastInvoiceLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        if (!token)
          throw new Error("No se encontró el token de autenticación.");
        const decodedToken = jwtDecode(token);
        const id = decodedToken.building_id;
        setBuildingId(id);
        setClientName(decodedToken.name);
        setBuildingAddress(decodedToken.building_address);
        setBuildingStartDate(decodedToken.start_date);
        setBuildingEndDate(decodedToken.end_date);

        const projectResponse = await axios.get(
          `http://localhost:8080/auth/building/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProjectData(projectResponse.data || null); // projectData?.estimatedPrice might be here

        await fetchBudget(id);
        await fetchInvoiceAmount(id);
        await fetchLastInvoice(id);
        await fetchEvents(id, new Date().getFullYear(), new Date().getMonth() + 1);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [fetchBudget, fetchEvents, fetchInvoiceAmount, fetchLastInvoice]);

  useEffect(() => {
    if (buildingId) {
      fetchEvents(
        buildingId,
        eventMonth.getFullYear(),
        eventMonth.getMonth() + 1
      );
    }
  }, [buildingId, eventMonth, fetchEvents]);

  // Use budgetAmount directly as the estimated price
  const estimatedPrice = budgetAmount !== null ? Number(budgetAmount) : 0;
  const paidAmount = Number(invoiceAmount) || 0;
  const pendingAmountValue = estimatedPrice - paidAmount;

  const formattedBuildingStartDate = formatDate(buildingStartDate);
  const formattedBuildingEndDate = formatDate(buildingEndDate);

  const formattedFasesProyecto = projectData?.projectPhases
    ? projectData.projectPhases.map((phase) => ({
        name: phase.nombre,
        startDate: phase.fechaInicio ? new Date(phase.fechaInicio) : null,
        endDate: phase.fechaFin ? new Date(phase.fechaFin) : null,
      }))
    : [];

  const timelineItems = [
    ...formattedFasesProyecto.map((fase) => ({
      type: "fase",
      date: fase.startDate,
      title: fase.name,
    })),
    ...events.map((evento) => ({
      type: "evento",
      date: new Date(evento.date),
      title: evento.title,
      description: evento.description,
    })),
  ].sort(
    (a, b) =>
      (a.date ? a.date.getTime() : Infinity) -
      (b.date ? b.date.getTime() : Infinity)
  );

  return {
    projectData,
    loading,
    error,
    buildingId,
    clientName,
    buildingAddress,
    buildingStartDate,
    buildingEndDate,
    events,
    eventLoading,
    eventError,
    eventMonth,
    setEventMonth,
    budgetAmount: estimatedPrice, // Return the processed estimatedPrice (budgetAmount)
    invoiceAmount: paidAmount,   // Return the processed paidAmount
    lastInvoice,
    lastInvoiceLoading,
    lastInvoiceError,
    pendingAmountValue,
    formattedBuildingStartDate,
    formattedBuildingEndDate,
    timelineItems,
    formatDate,
    fetchLastInvoice,
  };
};

export default ClientData;