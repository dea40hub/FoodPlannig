import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import TavoliGrid from "../components/TavoliGrid";
import PiattiSelector from "../components/PiattiSelector";

function ComandaModal({ tavolo, onClose, onSave }) {
  const [coperti, setCoperti] = useState(1);
  const [selectedPiatti, setSelectedPiatti] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [comandaEsistente, setComandaEsistente] = useState(null);
  const [comandaVisualizzata, setComandaVisualizzata] = useState(null);
  const [showComandaVisualizzata, setShowComandaVisualizzata] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteComanda, setNoteComanda] = useState("");

  // Placeholder: Simula caricamento comanda esistente
  useEffect(() => {
    async function loadComandaEsistente() {
      if (!tavolo || !tavolo.id) return;
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

  const salvaEChiudi = () => handleSubmit(null, true);

  const handleSubmit = async (e = null, chiudiModal = true) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
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
        companyId: "4b848a8a-0f89-446d-bbd8-37468919f327",
        tavoloId: tavolo.id,
        cameriereId: parseInt(cameriereId, 10),
        coperti: parseInt(coperti, 10),
        piatti: selectedPiatti, // Array di { piattoId, nome, quantita, turno }
      };

      // Placeholder: Simula chiamata API per salvare/aggiornare la comanda
      console.log("Salvataggio comanda (React):", comandaData);
      console.log("Fetching tavoli...");

      const url = "https://vendoloapitest.dea40.it/api/test/creaComandaTavolo";

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
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

      if (!json.success) {
        throw new Error("Errore durante il salvataggio della comanda");
      }

      onSave(json.data); // Notifica il parent del salvataggio

      // ✅ Mostra popup di conferma
      alert(`✅ Comanda salvata con successo per il tavolo ${tavolo.numero}`);

      if (chiudiModal) {
        onClose();
      }
    } catch (err) {
      console.error("Errore nel salvataggio della comanda:", err);
      setError(err.message || "Errore durante il salvataggio. Riprova.");
    } finally {
      setIsSaving(false);
    }
  };

  const sendToKitchen = async () => {
    try {
      // Ottieni l'ID del cameriere dal localStorage
      const cameriereId = localStorage.getItem("loggedInUserId");
      if (!cameriereId) {
        throw new Error("Sessione scaduta. Effettua nuovamente il login.");
      }

      const payload = {
        IdCompany: "4b848a8a-0f89-446d-bbd8-37468919f327",
        Idtavolo: tavolo.id,
      };

      console.log("Invio comanda in cucina:", payload);

      const url = "https://vendoloapitest.dea40.it/api/test/sendToKitchen";

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload), // Payload
      });

      if (!response.ok) {
        throw new Error(
          `Errore nella fetch: ${response.status} ${response.statusText}`
        );
      }

      const json = await response.json();
      console.log("✅ JSON ricevuto:", json);

      if (!json.success) {
        throw new Error("Errore durante l'invio della comanda");
      }

      onSave(json.data); // Notifica il parent del salvataggio

      // ✅ Mostra popup di conferma
      alert(`✅ Comanda inviata in cucina per il tavolo ${tavolo.numero}`);

      onClose();
    } catch (err) {
      console.error("Errore nel salvataggio della comanda:", err);
      setError(err.message || "Errore durante l'invio. Riprova.");
    } finally {
      setIsSaving(false);
    }
  };

  const visualizzaComanda = async () => {
    try {
      const url = `https://vendoloapitest.Dea40.it/api/test/getComandaPerTavolo?idTavolo=${tavolo.id}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Errore nel recupero della comanda");
      }

      const json = await response.json();
      console.log("📦 Comanda ricevuta:", json);

      if (!json.Piatti || !json.Piatti.length) {
        alert("⚠️ Nessuna comanda presente per questo tavolo.");
        return;
      }

      setComandaVisualizzata(json);
      setShowComandaVisualizzata(true);
    } catch (err) {
      console.error("Errore nel recupero della comanda:", err);
      alert("Errore durante il caricamento della comanda.");
    }
  };

  const printComandaConRawBT = () => {
    const piatti = showComandaVisualizzata
      ? comandaVisualizzata?.Piatti
      : selectedPiatti;

    if (!piatti || piatti.length === 0) {
      alert("❗ Nessun piatto selezionato per stampare la comanda.");
      return;
    }

    const piattiRiga = piatti
      .map((p) => `- ${p.quantita}x ${p.nome} (${p.turno || "T1"})`)
      .join("\n");

    const contenutoTesto = `
  
  VENDOLO - GESTIONE SALA
   -- nome ristorante --
  ------------------------------
  
  🍽️ COMANDA CUCINA
  
  Tavolo    : ${tavolo.numero}
  Coperti   : ${coperti}
  Cameriere : Maurilio Maruccio
  ------------------------------
  ${piattiRiga}
  ------------------------------
  Ora: ${new Date().toLocaleTimeString()}
  ${
    noteComanda?.trim()
      ? `------------------------------
  📝 NOTE COMANDA:
  ${noteComanda.trim()}`
      : ""
  }
  
  `;

    const encodedText = encodeURIComponent(contenutoTesto);
    window.location.href = `rawbt:print?data=text/plain,${encodedText}`;
  };

  if (!tavolo) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
        {/* Modal Content */}
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-300">
          
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white px-6 py-5 flex justify-between items-center border-b">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <span className="text-2xl">🍽️</span>
              {comandaEsistente ? "Aggiorna Comanda" : "Nuova Comanda"} – Tavolo {tavolo.numero}
            </h2>
            <button 
              onClick={onClose} 
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-lg transition-all duration-200 hover:scale-105"
            >
              ×
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {showComandaVisualizzata && comandaVisualizzata ? (
              /* Vista Comanda Attuale */
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🧾</span>
                  <h3 className="text-lg font-bold text-gray-800">Comanda Attuale</h3>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-gray-700 font-medium">
                    <span className="font-bold">Coperti:</span> {comandaVisualizzata.coperti}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Quantità</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Piatto</th>
                        <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Turno</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {comandaVisualizzata.Piatti.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-4 px-6 font-semibold text-gray-900">{p.quantita}x</td>
                          <td className="py-4 px-6 text-gray-800">{p.nome}</td>
                          <td className="py-4 px-6">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {p.turno}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {noteComanda?.trim() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📝</span>
                      <h4 className="font-semibold text-amber-800">Note Comanda</h4>
                    </div>
                    <p className="text-amber-700 leading-relaxed whitespace-pre-wrap">{noteComanda.trim()}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Vista Standard Form */
              <div className="space-y-6">
                {/* Coperti */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <label htmlFor="coperti" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    Numero Coperti
                  </label>
                  <input
                    type="number"
                    id="coperti"
                    value={coperti}
                    onChange={(e) => setCoperti(e.target.value)}
                    min="1"
                    max="20"
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-center transition-all duration-200"
                    required
                  />
                </div>

                {/* Selezione Piatti */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-lg">🍽️</span>
                    Seleziona Piatti
                  </label>
                  <PiattiSelector onPiattiChange={handlePiattiChange} />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-red-500 text-lg">⚠️</span>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 border-t px-6 py-5">
            {showComandaVisualizzata ? (
              /* Azioni per Vista Comanda */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg"
                  onClick={sendToKitchen}
                  disabled={!comandaVisualizzata?.Piatti?.length}
                >
                  <span>🔥</span>
                  Invia in Cucina
                </button>

                <button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg"
                  onClick={printComandaConRawBT}
                  disabled={!comandaVisualizzata?.Piatti?.length}
                >
                  <span>🖨️</span>
                  Stampa Scontrino
                </button>

                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
                  onClick={() => setShowComandaVisualizzata(false)}
                >
                  <span>←</span>
                  Chiudi
                </button>
              </div>
            ) : (
              /* Azioni Standard */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 col-span-1"
                >
                  <span>✕</span>
                  <span className="hidden sm:inline">Annulla</span>
                </button>

                <button
                  type="button"
                  onClick={salvaEChiudi}
                  disabled={isSaving || selectedPiatti.length === 0}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg col-span-1"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="hidden sm:inline">Salvando...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span className="hidden sm:inline">Salva</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={printComandaConRawBT}
                  disabled={selectedPiatti.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg col-span-1"
                >
                  <span>🖨️</span>
                  <span className="hidden sm:inline">Stampa</span>
                </button>

                <button
                  type="button"
                  onClick={visualizzaComanda}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg col-span-1"
                >
                  <span>👁️</span>
                  <span className="hidden sm:inline">Visualizza</span>
                </button>

                <button
                  type="button"
                  onClick={sendToKitchen}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg col-span-1"
                >
                  <span>🔥</span>
                  <span className="hidden sm:inline">Cucina</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowNoteModal(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg col-span-1"
                >
                  <span>📝</span>
                  <span className="hidden sm:inline">Note</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Note */}
      {showNoteModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-in fade-in duration-300"
          onClick={() => setShowNoteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border animate-in zoom-in-95 duration-300"
          >
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>📝</span>
                Note Comanda
              </h3>
              <button 
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white w-8 h-8 rounded-lg flex items-center justify-center font-semibold transition-all duration-200"
                onClick={() => setShowNoteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Inserisci note per la cucina o il servizio:
                </label>
                <textarea
                  value={noteComanda}
                  onChange={(e) => setNoteComanda(e.target.value)}
                  rows={6}
                  placeholder="Esempio: Cliente celiaco, cuocere senza sale, ecc..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                  onClick={() => setShowNoteModal(false)}
                >
                  Annulla
                </button>
                <button
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                  onClick={() => setShowNoteModal(false)}
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SalaPage() {
  const [selectedTavolo, setSelectedTavolo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSession, setUserSession] = useState(null);

  // Recupera i dati dell'utente dalla sessione
  useEffect(() => {
    const session = sessionStorage.getItem('userSession');
    if (session) {
      setUserSession(JSON.parse(session));
    }
  }, []);

  useEffect(() => {
    console.log("📍 selectedTavolo:", selectedTavolo);
    console.log("📍 isModalOpen:", isModalOpen);
  }, [selectedTavolo, isModalOpen]);

  // Funzione per il logout
  const handleLogout = () => {
    // Conferma logout
    if (window.confirm('Sei sicuro di voler uscire?')) {
      // Pulisce tutti i dati della sessione
      sessionStorage.removeItem('userSession');
      sessionStorage.removeItem('currentCameriere');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('companyId');
      sessionStorage.removeItem('companyName');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userRoles');
      
      // Reindirizza alla pagina di login
      window.location.href = '/login'; // Oppure navigate('/login') se usi React router
    }
  };

  // Funzione per gestire la selezione di un tavolo
  const handleSelectTavolo = (tavolo) => {
    setSelectedTavolo(tavolo);
    setIsModalOpen(true);
  };

  // Funzione per chiudere il modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    // setSelectedTavolo(null); // Deseleziona il tavolo quando il modal si chiude
  };

  // Funzione chiamata dopo il salvataggio della comanda
  const handleSaveComanda = (comandaSalvata) => {
    console.log("Comanda salvata/aggiornata:", comandaSalvata);
    // setIsModalOpen(false);
    // setSelectedTavolo(null);
    // Qui potresti voler aggiornare lo stato dei tavoli se necessario,
    // ma TavoliGrid si aggiorna già periodicamente
  };

  // Prepara i dati utente per l'header
  const headerUserData = userSession ? {
    nomeCompleto: userSession.nomeCompleto || `${userSession.data?.user?.firstName || ''} ${userSession.data?.user?.lastName || ''}`.trim(),
    companyName: userSession.data?.user?.companyName || '',
    ruolo: userSession.ruoloSelezionato || 'Cameriere',
    email: userSession.data?.user?.email || '',
    onLogout: handleLogout // Passa la funzione di logout all'header
  } : {
    nomeCompleto: 'Utente',
    companyName: 'Azienda',
    ruolo: 'Cameriere',
    email: '',
    onLogout: handleLogout
  };

  return (
    <div>
      <Header userInfo={headerUserData} />
      <div className="container">
        <TavoliGrid onSelectTavolo={handleSelectTavolo} />
      </div>
      {isModalOpen && (
        <ComandaModal
          tavolo={selectedTavolo}
          onClose={handleCloseModal}
          onSave={handleSaveComanda}
        />
      )}
    </div>
  );
}

export default SalaPage;