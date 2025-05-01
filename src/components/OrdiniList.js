import React, { useState, useEffect } from 'react';

// Placeholder: Simula chiamata API per ottenere gli ordini per la cucina
async function fetchOrdiniCucina() {
  console.log("Fetching ordini cucina...");
  await new Promise(resolve => setTimeout(resolve, 700)); // Simula attesa API
  // Dati fittizi basati sullo schema DB
  return [
    {
      id: 1,
      tavolo_numero: 5,
      coperti: 2,
      stato: 'aperta',
      dettagli: [
        { id: 101, piatto_nome: 'Spaghetti al Pomodoro', quantita: 1, turno: 'T1', stato: 'da_preparare' },
        { id: 102, piatto_nome: 'Acqua Naturale', quantita: 2, turno: 'T1', stato: 'da_preparare' },
        { id: 103, piatto_nome: 'Bistecca ai Ferri', quantita: 1, turno: 'T2', stato: 'da_preparare' },
      ]
    },
    {
      id: 2,
      tavolo_numero: 12,
      coperti: 4,
      stato: 'in_preparazione',
      dettagli: [
        { id: 201, piatto_nome: 'Margherita', quantita: 2, turno: 'T1', stato: 'in_preparazione' },
        { id: 202, piatto_nome: 'Diavola', quantita: 1, turno: 'T1', stato: 'pronto' },
        { id: 203, piatto_nome: 'Coca Cola', quantita: 4, turno: 'T1', stato: 'pronto' },
        { id: 204, piatto_nome: 'Tiramisù', quantita: 3, turno: 'T3', stato: 'da_preparare' },
      ]
    }
  ];
}

// Placeholder: Simula chiamata API per aggiornare lo stato di un piatto
async function updateStatoPiatto(dettaglioId, nuovoStato) {
  console.log(`Aggiornamento stato piatto ${dettaglioId} a ${nuovoStato}`);
  await new Promise(resolve => setTimeout(resolve, 300)); // Simula attesa API
  return { success: true };
}

function OrdiniList() {
  const [ordini, setOrdini] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOrdini() {
      try {
        if (ordini.length === 0) setLoading(true);
        const data = await fetchOrdiniCucina();
        setOrdini(data);
        setError(null);
      } catch (err) {
        console.error("Errore nel caricamento degli ordini per la cucina:", err);
        setError("Impossibile caricare gli ordini: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrdini();
    // Imposta un intervallo per aggiornare gli ordini periodicamente
    const intervalId = setInterval(loadOrdini, 30000); // Aggiorna ogni 30 secondi
    return () => clearInterval(intervalId); // Pulisce l'intervallo allo smontaggio
  }, [ordini.length]);

  const handleStatoChange = async (dettaglioId, nuovoStato) => {
    try {
      // Chiamata API per aggiornare lo stato
      await updateStatoPiatto(dettaglioId, nuovoStato);

      // Aggiorna lo stato localmente per un feedback immediato
      setOrdini(prevOrdini =>
        prevOrdini.map(ordine => ({
          ...ordine,
          dettagli: ordine.dettagli.map(dettaglio =>
            dettaglio.id === dettaglioId ? { ...dettaglio, stato: nuovoStato } : dettaglio
          )
        }))
      );
    } catch (err) {
      console.error("Errore nell'aggiornamento dello stato del piatto:", err);
      alert(`Errore nell'aggiornamento dello stato: ${err.message}`);
    }
  };

  const getStatoClass = (stato) => {
    switch (stato) {
      case 'da_preparare': return 'stato-da-preparare';
      case 'in_preparazione': return 'stato-in-preparazione';
      case 'pronto': return 'stato-pronto';
      default: return '';
    }
  };

  if (loading && ordini.length === 0) {
    return <div className="text-center p-10">Caricamento ordini cucina...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }

  if (ordini.length === 0) {
    return <div className="text-center p-10 text-gray-500">Nessun ordine attivo in cucina.</div>;
  }

  // Raggruppa i piatti per turno all'interno di ogni ordine
  const ordiniRaggruppati = ordini.map(ordine => {
    const piattiPerTurno = ordine.dettagli.reduce((acc, dettaglio) => {
      const turno = dettaglio.turno || 'N/A';
      if (!acc[turno]) {
        acc[turno] = [];
      }
      acc[turno].push(dettaglio);
      return acc;
    }, {});
    // Ordina i turni
    const turniOrdinati = Object.keys(piattiPerTurno).sort();
    const piattiPerTurnoOrdinati = {};
    turniOrdinati.forEach(turno => {
        piattiPerTurnoOrdinati[turno] = piattiPerTurno[turno];
    });
    return { ...ordine, piattiPerTurno: piattiPerTurnoOrdinati };
  });

  return (
    <div className="ordini-list">
      {ordiniRaggruppati.map(ordine => (
        <div key={ordine.id} className="ordine-card">
          <div className="ordine-header">
            <h3>Tavolo {ordine.tavolo_numero} <span style={{fontSize: '0.9rem', fontWeight: 'normal'}}>({ordine.coperti} coperti)</span></h3>
          </div>
          <div className="ordine-body">
            {Object.entries(ordine.piattiPerTurno).map(([turno, dettagli]) => (
              <div key={turno} className="turno-section">
                <h4>Turno: {turno}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {dettagli.map(dettaglio => (
                    <li key={dettaglio.id} className="piatto-row">
                      <span>{dettaglio.quantita} x {dettaglio.piatto_nome}</span>
                      <select
                        value={dettaglio.stato}
                        onChange={(e) => handleStatoChange(dettaglio.id, e.target.value)}
                        className={`stato-select ${getStatoClass(dettaglio.stato)}`}
                      >
                        <option value="da_preparare">Da Preparare</option>
                        <option value="in_preparazione">In Preparazione</option>
                        <option value="pronto">Pronto</option>
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrdiniList;

