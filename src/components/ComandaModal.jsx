import React, { useState, useEffect } from "react";
import PiattiSelector from "./PiattiSelector";

function ComandaModal({ tavolo, onClose, onSave }) {
  const [coperti, setCoperti] = useState(1);
  const [selectedPiatti, setSelectedPiatti] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [comandaEsistente, setComandaEsistente] = useState(null);

  // Placeholder: Simula caricamento comanda esistente
  useEffect(() => {
    async function loadComandaEsistente() {
      if (tavolo && tavolo.stato === "occupato") {
        console.log(`Caricamento comanda esistente per tavolo ${tavolo.id}...`);
        await new Promise((resolve) => setTimeout(resolve, 200)); // Simula attesa API
        // Simula una comanda esistente
        const mockComanda = {
          id: Math.floor(Math.random() * 100) + 100,
          tavolo_id: tavolo.id,
          cameriere_id: 1, // ID fittizio
          coperti: (tavolo.numero % 4) + 1, // Coperti fittizi
          stato: "aperta",
          dettagli: [], // Inizialmente vuota, si aggiungono solo nuovi piatti
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

  const handleSubmit_old = async (e) => {
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
      const cameriereId = localStorage.getItem("loggedInUserId");
      if (!cameriereId) {
        throw new Error("Sessione scaduta. Effettua nuovamente il login.");
      }

      const comandaData = {
        tavoloId: tavolo.id,
        cameriereId: parseInt(cameriereId, 10),
        coperti: parseInt(coperti, 10),
        piatti: selectedPiatti, // Array di { piattoId, nome, quantita, turno }
      };

      // Placeholder: Simula chiamata API per salvare/aggiornare la comanda
      console.log("Salvataggio comanda (React):", comandaData);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula chiamata API

      // Simula risposta API
      const mockResponse = {
        success: true,
        data: {
          ...comandaData,
          id: comandaEsistente
            ? comandaEsistente.id
            : Math.floor(Math.random() * 1000) + 200,
        },
      };

      if (!mockResponse.success) {
        throw new Error(
          mockResponse.message || "Errore durante il salvataggio della comanda"
        );
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
      const cameriereId = localStorage.getItem("loggedInUserId");
      if (!cameriereId) {
        throw new Error("Sessione scaduta. Effettua nuovamente il login.");
      }

      const comandaData = {
        companyId: '591C7617-DF68-4C82-9EF0-7DEBF5C71DE4',
        tavoloId: tavolo.id,
        cameriereId: parseInt(cameriereId, 10),
        coperti: parseInt(coperti, 10),
        piatti: selectedPiatti, // Array di { piattoId, nome, quantita, turno }
      };

      // Placeholder: Simula chiamata API per salvare/aggiornare la comanda
      console.log("Salvataggio comanda (React):", comandaData);
      console.log("Fetching tavoli...");

      //const url = "http://localhost/VendoloApi/api/test/creaComandaTavolo";
      const url = "https://vendoloapi.dea40.it/api/test/creaComandaTavolo";

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
        body: JSON.stringify(comandaData), // Payload
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

      // // Simula risposta API
      // const mockResponse = {
      //   success: true,
      //   data: {
      //     ...comandaData,
      //     id: comandaEsistente
      //       ? comandaEsistente.id
      //       : Math.floor(Math.random() * 1000) + 200,
      //   },
      // };

      if (!json.success) {
        throw new Error(
          mockResponse.message || "Errore durante il salvataggio della comanda"
        );
      }

      onSave(json.data); // Notifica il parent del salvataggio
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
            {comandaEsistente ? "Aggiorna Comanda" : "Nuova Comanda"} - Tavolo{" "}
            {tavolo.numero}
          </h2>
          <button onClick={onClose} className="btn btn-secondary">
            X
          </button>
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
                style={{ width: "80px" }}
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
              {isSaving ? "Salvataggio..." : "Salva Comanda"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComandaModal;
