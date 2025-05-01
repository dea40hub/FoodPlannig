import React, { useState, useEffect } from 'react';
import PiattiSelector from './PiattiSelector';

function ComandaModal({ tavolo, onClose, onSave }) {
  const [coperti, setCoperti] = useState(1);
  const [selectedPiatti, setSelectedPiatti] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [comandaEsistente, setComandaEsistente] = useState(null);

  // Placeholder: Simula caricamento comanda esistente
  useEffect(() => {
    async function loadComandaEsistente() {
      if (tavolo && tavolo.stato === 'occupato') {
        console.log(`Caricamento comanda esistente per tavolo ${tavolo.id}...`);
        await new Promise(resolve => setTimeout(resolve, 200)); // Simula attesa API
        // Simula una comanda esistente
        const mockComanda = {
          id: Math.floor(Math.random() * 100) + 100,
          tavolo_id: tavolo.id,
          cameriere_id: 1, // ID fittizio
          coperti: tavolo.numero % 4 + 1, // Coperti fittizi
          stato: 'aperta',
          dettagli: [] // Inizialmente vuota, si aggiungono solo nuovi piatti
        };
        setComandaEsistente(mockComanda);
        setCoperti(mockComanda.coperti);
      } else {
        // Resetta se è un nuovo tavolo o se il modal viene riaperto per un tavolo libero
        setComandaEsistente(null);
        setCoperti(1);
        setSelectedPiatti([]);
      }
    }
    loadComandaEsistente();
  }, [tavolo]);

  const handlePiattiChange = (piatti) => {
    setSelectedPiatti(piatti);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (selectedPiatti.length === 0) {
      setError("Seleziona almeno un piatto per salvare la comanda.");
      setIsSaving(false);
      return;
    }

    try {
      // Ottieni l'ID del cameriere dal localStorage
      const cameriereId = localStorage.getItem('loggedInUserId');
      if (!cameriereId) {
        throw new Error("Sessione scaduta. Effettua nuovamente il login.");
      }

      const comandaData = {
        tavoloId: tavolo.id,
        cameriereId: parseInt(cameriereId, 10),
        coperti: parseInt(coperti, 10),
        piatti: selectedPiatti // Array di { piattoId, nome, quantita, turno }
      };

      // Placeholder: Simula chiamata API per salvare/aggiornare la comanda
      console.log("Salvataggio comanda (React):", comandaData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula chiamata API
      
      // Simula risposta API
      const mockResponse = { success: true, data: { ...comandaData, id: comandaEsistente ? comandaEsistente.id : Math.floor(Math.random() * 1000) + 200 } };

      if (!mockResponse.success) {
        throw new Error(mockResponse.message || 'Errore durante il salvataggio della comanda');
      }

      onSave(mockResponse.data); // Notifica il parent del salvataggio
      onClose(); // Chiude il modal dopo il salvataggio
    } catch (err) {
      console.error("Errore nel salvataggio della comanda:", err);
      setError(err.message || "Errore durante il salvataggio. Riprova.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!tavolo) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {comandaEsistente ? 'Aggiorna Comanda' : 'Nuova Comanda'} - Tavolo {tavolo.numero}
          </h2>
          <button onClick={onClose} className="btn btn-secondary">X</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="coperti">Coperti:</label>
              <input
                type="number"
                id="coperti"
                value={coperti}
                onChange={(e) => setCoperti(e.target.value)}
                min="1"
                className="form-control"
                style={{ width: '80px' }}
                required
              />
            </div>

            <PiattiSelector onPiattiChange={handlePiattiChange} />

            {error && <p className="error-message">{error}</p>}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn btn-secondary"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSaving || selectedPiatti.length === 0}
              className="btn btn-primary"
            >
              {isSaving ? 'Salvataggio...' : 'Salva Comanda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComandaModal;

