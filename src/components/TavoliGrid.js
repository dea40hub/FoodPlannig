import React, { useState, useEffect } from 'react';

// Placeholder: Simula chiamata API per ottenere i tavoli
async function fetchTavoliAPI() {
  console.log("Fetching tavoli...");
  await new Promise(resolve => setTimeout(resolve, 300)); // Simula attesa API
  // Dati fittizi basati sullo schema DB
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    stato: Math.random() > 0.7 ? 'occupato' : 'libero' // Stato casuale per demo
  }));
}

function TavoliGrid({ onSelectTavolo }) {
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
        setError(`Impossibile caricare i tavoli: ${err.message}. Riprovare più tardi.`);
        setTavoli([]); // Resetta i tavoli in caso di errore
      } finally {
        setLoading(false);
      }
    }

    loadTavoli();
    // Imposta un intervallo per aggiornare i tavoli periodicamente
    const intervalId = setInterval(loadTavoli, 5000); // Aggiorna ogni 5 secondi
    return () => clearInterval(intervalId); // Pulisce l'intervallo allo smontaggio

  }, [tavoli.length]); // Dipendenza aggiunta per gestire il loading iniziale

  const getCardClass = (stato) => {
    return stato === 'libero' ? 'tavolo-libero' : 'tavolo-occupato';
  };

  if (loading && tavoli.length === 0) {
    return <div className="text-center p-10">Caricamento tavoli...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  if (!tavoli || tavoli.length === 0) {
    return <div className="text-center p-10 text-gray-500">Nessun tavolo trovato.</div>;
  }

  return (
    <div className="tavoli-grid">
      {tavoli.map((tavolo) => (
        <div
          key={tavolo.id}
          onClick={() => onSelectTavolo(tavolo)} // Passa l'intero oggetto tavolo
          className={`tavolo-card ${getCardClass(tavolo.stato)}`}
        >
          <span className="tavolo-numero">{tavolo.numero}</span>
          <span className="tavolo-stato">({tavolo.stato})</span>
        </div>
      ))}
    </div>
  );
}

export default TavoliGrid;

