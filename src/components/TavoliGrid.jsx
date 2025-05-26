import React, { useState, useEffect } from "react";

// Placeholder: Simula chiamata API per ottenere i tavoli
async function fetchTavoliAPI_SIM() {
  console.log("Fetching tavoli...");
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simula attesa API
  // Dati fittizi basati sullo schema DB
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    stato: Math.random() > 0.7 ? "occupato" : "libero", // Stato casuale per demo
  }));
}

async function fetchTavoliAPI() {
  console.log("Fetching tavoli...");

  //const url = "http://localhost/VendoloApi/api/test/getTavoliSala";
  const url = "https://vendoloapitest.dea40.it/api/test/getTavoliSala";

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    //Authorization: `Bearer ${userToken}`, // Usa un token
  };

  console.log("🔹 Endpoint finale:", url);
  console.log("🔹 Headers inviati:", headers);
  console.log(
    "🚀 Fetch sta per inviare la richiesta della lista dei tavoli della sala ..."
  );

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ IdCompany: "4b848a8a-0f89-446d-bbd8-37468919f327" }), // Payload
  });

  console.log("✅ Response ricevuta con status:", response.status);
  console.log("✅ Response ricevuta con status text:", response.statusText);
  console.log("✅ Response headers:", response.headers);
  console.log("✅ Response body:", response.body);

  if (!response.ok) {
    throw new Error(
      `Errore nella fetch: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();
  console.log("✅ JSON ricevuto:", json);

  if (json.success && Array.isArray(json.tavoli)) {
    const tavoliFormattati = json.tavoli.map((t) => ({
      id: t.Id,
      nome: t.Nome.trim(),
      numero: t.Numero,
      stato: t.Stato.toLowerCase(), // "libero" o "occupato"
      dettagli: t.Dettagli,
    }));
    console.log("📦 Tavoli formattati:", tavoliFormattati);
    return tavoliFormattati;
  } else {
    console.warn("⚠️ Chiamata andata a buon fine, ma 'success' è false");
    return [];
  }

  // return Array.from({ length: 20 }, (_, i) => ({
  //   id: i + 1,
  //   numero: i + 1,
  //   stato: Math.random() > 0.7 ? "occupato" : "libero", // Stato casuale per demo
  // }));
}

function TavoliGrid({ onSelectTavolo, selectedTable }) {
  const [tavoli, setTavoli] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTavoli() {
      try {
        // Non ricaricare se non è il primo caricamento (per evitare sfarfallio durante l'aggiornamento)
        if (tavoli.length === 0) setLoading(true);
        const data = await fetchTavoliAPI();
        setTavoli(data);
        setError(null);
      } catch (err) {
        console.error("Errore nel caricamento dei tavoli:", err);
        setError(
          `Impossibile caricare i tavoli: ${err.message}. Riprovare più tardi.`
        );
        setTavoli([]); // Resetta i tavoli in caso di errore
      } finally {
        setLoading(false);
      }
    }

    loadTavoli();
    // Imposta un intervallo per aggiornare i tavoli periodicamente
    const intervalId = setInterval(loadTavoli, 60000); // Aggiorna ogni 5 secondi
    return () => clearInterval(intervalId); // Pulisce l'intervallo allo smontaggio
  }, [tavoli.length]); // Dipendenza aggiunta per gestire il loading iniziale

  const getCardClass = (stato) => {
    return stato === "libero" ? "tavolo-libero" : "tavolo-occupato";
  };

  if (loading && tavoli.length === 0) {
    return <div className="text-center p-10">Caricamento tavoli...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  if (!tavoli || tavoli.length === 0) {
    return (
      <div className="text-center p-10 text-gray-500">
        Nessun tavolo trovato.
      </div>
    );
  }

  return (
    <div className="tavoli-grid">
      {tavoli.map((tavolo) => (
        <div
          key={tavolo.id}
          onClick={() => onSelectTavolo(tavolo)} // Passa l'intero oggetto tavolo
          className={`tavolo-card ${getCardClass(tavolo.stato)} ${selectedTable?.id === tavolo.id ? "selected" : ""}`}

        >
          <span className="tavolo-numero">{tavolo.numero}</span>
          <span className="tavolo-stato">({tavolo.stato})</span>
        </div>
      ))}
    </div>
  );
}

export default TavoliGrid;
