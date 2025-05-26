import React, { useState, useEffect } from "react";
import PiattiSelector from "./PiattiSelector";

function ComandaModal({ tavolo, onClose, onSave }) {
  const [coperti, setCoperti] = useState(1);
  const [selectedPiatti, setSelectedPiatti] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [comandaEsistente, setComandaEsistente] = useState(null);
  const [comandaVisualizzata, setComandaVisualizzata] = useState(null);
  const [showComandaVisualizzata, setShowComandaVisualizzata] = useState(false);

  //Placeholder: Simula caricamento comanda esistente
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

  // useEffect(() => {
  //   async function loadComandaEsistente() {
  //     if (!tavolo || !tavolo.id) return;

  //     if (tavolo.stato === "occupato") {
  //       console.log(
  //         `📦 Caricamento comanda esistente per tavolo ${tavolo.id}...`
  //       );

  //       try {
  //         const response = await fetch(
  //          `https://vendoloapi.dea40.it/api/test/getComandaPerTavolo?idTavolo=${tavolo.id}`
  //          //`http://localhost/VendoloApi/api/test/getComandaPerTavolo?idTavolo=${tavolo.id}`
  //         );
  //         const json = await response.json();

  //         if (!json || json.success === false || !json.piatti) {
  //           console.warn("⚠️ Nessuna comanda trovata o formato non valido");
  //           return;
  //         }

  //         const comandaEsistente = {
  //           id: Math.floor(Math.random() * 1000) + 100, // ID fittizio locale
  //           tavolo_id: json.tavoloId,
  //           cameriere_id: json.cameriereId,
  //           coperti: json.coperti,
  //           stato: "aperta",
  //           dettagli: json.piatti,
  //         };

  //         console.log("✅ Comanda esistente caricata:", comandaEsistente);
  //         setComandaEsistente(comandaEsistente);
  //         setCoperti(json.coperti);
  //         setSelectedPiatti(json.piatti);
  //       } catch (err) {
  //         console.error("❌ Errore durante il caricamento della comanda:", err);
  //       }
  //     } else {
  //       // Reset per tavolo libero
  //       setComandaEsistente(null);
  //       setCoperti(1);
  //       setSelectedPiatti([]);
  //     }
  //   }

  //   loadComandaEsistente();
  // }, [tavolo]);

  const handlePiattiChange = (piatti) => {
    setSelectedPiatti(piatti);
    // Salvataggio automatico ogni volta che cambiano i piatti
    // handleSubmit(null, false); // false = non chiudere il modal
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

      //const url = "http://localhost/VendoloApi/api/test/creaComandaTavolo";
      const url = "https://vendoloapitest.dea40.it/api/test/creaComandaTavolo";

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

      // Placeholder: Simula chiamata API per salvare/aggiornare la comanda
      console.log("Invio comanda in cucina:", payload);
      console.log("Fetching tavoli...");

      //const url = "http://localhost/VendoloApi/api/test/sendToKitchen";
      const url = "https://vendoloapitest.dea40.it/api/test/sendToKitchen";

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        //Authorization: `Bearer ${userToken}`, // Usa un token
      };

      console.log("🔹 Endpoint finale:", url);
      console.log("🔹 Headers inviati:", headers);
      console.log(
        "🚀 Fetch sta per inviare la richiesta di invio della comanda alla cucina ..."
      );

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload), // Payload
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
        throw new Error(
          mockResponse.message || "Errore durante il salvataggio della comanda"
        );
      }

      onSave(json.data); // Notifica il parent del salvataggio

      // ✅ Mostra popup di conferma
      alert(`✅ Comanda inviata in cucina per il tavolo ${tavolo.numero}`);

      onClose();
    } catch (err) {
      console.error("Errore nel salvataggio della comanda:", err);
      setError(err.message || "Errore durante il salvataggio. Riprova.");
    } finally {
      setIsSaving(false);
    }
  };

  const visualizzaComanda = async () => {
    try {
      // const url = `http://localhost/VendoloApi/api/test/getComandaPerTavolo?idTavolo=${tavolo.id}`;
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

  const handleSubmit_new = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (selectedPiatti.length === 0) {
      setError("Seleziona almeno un piatto per salvare la comanda.");
      setIsSaving(false);
      return;
    }

    try {
      const cameriereId = localStorage.getItem("loggedInUserId");
      if (!cameriereId) {
        throw new Error("Sessione scaduta. Effettua nuovamente il login.");
      }

      const comandaData = {
        companyId: "4b848a8a-0f89-446d-bbd8-37468919f327",
        tavoloId: tavolo.id,
        cameriereId: parseInt(cameriereId, 10),
        coperti: parseInt(coperti, 10),
        piatti: selectedPiatti,
      };

      const response = await fetch(
        // "http://localhost/VendoloApi/api/test/creaComandaTavolo",
        "https://vendoloapitest.dea40.it/api/test/creaComandaTavolo",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(comandaData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Errore nella fetch: ${response.status} ${response.statusText}`
        );
      }

      const json = await response.json();
      console.log("✅ JSON ricevuto:", json);

      if (!json.success) {
        throw new Error("Errore durante il salvataggio della comanda.");
      }

      const comandaAttuale = {
        success: json.success,
        data: {
          ...comandaData,
          id: comandaEsistente
            ? comandaEsistente.id
            : Math.floor(Math.random() * 1000) + 200,
        },
      };

      onSave(comandaAttuale.data);
      alert("✅ Comanda salvata con successo!");
      onClose();
    } catch (err) {
      console.error("Errore nel salvataggio della comanda:", err);
      setError(err.message || "Errore durante il salvataggio. Riprova.");
    } finally {
      setIsSaving(false);
    }
  };

  const printComandaConRawBT_test1 = () => {
    if (!selectedPiatti.length) {
      alert("❗ Nessun piatto selezionato per stampare la comanda.");
      return;
    }

    const piattiRiga = selectedPiatti
      .map((p) => `${p.quantita}x ${p.nome} (${p.turno || "T1"})`)
      .join("<br/>");

    const contenutoHTML = `
      <style>
        body { font-family: monospace; font-size: 13px; }
        h2 { margin-bottom: 5px; }
        .riga { margin-bottom: 2px; }
      </style>
      <h2>🍽️ COMANDA CUCINA</h2>
      <div>Tavolo: ${tavolo.numero}</div>
      <div>Coperti: ${coperti}</div>
      <div>------------------------------</div>
      <div class="riga">${piattiRiga}</div>
      <div>------------------------------</div>
      <div>Ora: ${new Date().toLocaleTimeString()}</div>
    `;

    const blob = new Blob([contenutoHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Invia il contenuto a RawBT
    window.location.href = `rawbt:print?data=${encodeURIComponent(url)}`;
  };

  const printComandaConRawBT_Test2 = () => {
    if (!selectedPiatti.length) {
      alert("❗ Nessun piatto selezionato per stampare la comanda.");
      return;
    }

    const piattiRiga = selectedPiatti
      .map((p) => `${p.quantita}x ${p.nome} (${p.turno || "T1"})`)
      .join("<br/>");

    const contenutoHTML = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: monospace; font-size: 13px; padding: 10px; }
            h2 { margin-bottom: 5px; }
            .riga { margin-bottom: 2px; }
          </style>
        </head>
        <body>
          <h2>🍽️ COMANDA CUCINA</h2>
          <div>Tavolo: ${tavolo.numero}</div>
          <div>Coperti: ${coperti}</div>
          <div>------------------------------</div>
          <div class="riga">${piattiRiga}</div>
          <div>------------------------------</div>
          <div>Ora: ${new Date().toLocaleTimeString()}</div>
        </body>
      </html>
    `;

    const encodedData = encodeURIComponent(contenutoHTML);

    // Reindirizza direttamente a RawBT con tutto il contenuto HTML nel parametro data=
    window.location.href = `rawbt:print?data=text/html,${encodedData}`;
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

  `;

    const encodedText = encodeURIComponent(contenutoTesto);
    window.location.href = `rawbt:print?data=text/plain,${encodedText}`;
  };

  const printComandaConRawBT_Test_esc = () => {
    if (!selectedPiatti.length) {
      alert("❗ Nessun piatto selezionato per stampare la comanda.");
      return;
    }

    // Inizio comandi ESC/POS
    let comanda = "";

    comanda += "\x1B\x40"; // Init printer
    comanda += "\x1B\x21\x08"; // Bold + Font A
    comanda += "VENDOLO - GESTIONE SALA\n";
    comanda += "-- nome ristorante --\n";
    comanda += "------------------------------\n\n";

    comanda += "\x1B\x21\x00"; // Font normale
    comanda += "🍽️ COMANDA CUCINA\n\n";
    comanda += `Tavolo    : ${tavolo.numero}\n`;
    comanda += `Coperti   : ${coperti}\n`;
    comanda += `Cameriere : Maurilio Maruccio\n`;
    comanda += "------------------------------\n";

    // Piatti con font più piccolo
    comanda += "\x1B\x21\x01"; // Font B (più piccolo)
    selectedPiatti.forEach((p) => {
      comanda += `- ${p.quantita}x ${p.nome} (${p.turno || "T1"})\n`;
    });

    comanda += "\x1B\x21\x00"; // Ripristina font normale
    comanda += "------------------------------\n";
    comanda += `Ora: ${new Date().toLocaleTimeString()}\n\n\n`;

    comanda += "\x1D\x56\x41"; // Cut paper (se supportato)

    // Codifica ESC/POS in base64
    const base64 = btoa(unescape(encodeURIComponent(comanda)));
    window.location.href = `rawbt:print?data=base64,${base64}`;
  };

  if (!tavolo) return null;

  return (
    /* ─────────────── MODAL OVERLAY (copre tutta la pagina) ─────────────── */
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.45)", // overlay semitrasparente
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "10px",
      }}
    >
      {/* ───────────── MODAL CONTENT (card bianca centrata) ───────────── */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "650px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        }}
      >
        {/* ───────────── HEADER ───────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e5e5",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.4rem" }}>
            {comandaEsistente ? "Aggiorna Comanda" : "Nuova Comanda"} – Tavolo{" "}
            {tavolo.numero}
          </h2>
          <button onClick={onClose} className="btn btn-secondary">
            X
          </button>
        </div>

        {/* ───────────── BODY / FORM ───────────── */}
        <form
          style={{ flex: 1, overflowY: "auto" }}
          onSubmit={(e) => e.preventDefault()}
        >
          {showComandaVisualizzata && comandaVisualizzata ? (
            /* ======= VISTA “COMANDA ATTUALE” A SCHERMO INTERO ======= */
            <div style={{ padding: "24px" }}>
              <h5
                style={{
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span role="img" aria-label="receipt">
                  🧾
                </span>
                &nbsp;<strong>Comanda Attuale</strong>
              </h5>

              <p style={{ marginBottom: "12px" }}>
                <strong>Coperti:</strong> {comandaVisualizzata.coperti}
              </p>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #ccc" }}>
                    <th style={{ textAlign: "left", padding: "8px" }}>
                      Quantità
                    </th>
                    <th style={{ textAlign: "left", padding: "8px" }}>
                      Piatto
                    </th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Turno</th>
                  </tr>
                </thead>
                <tbody>
                  {comandaVisualizzata.Piatti.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px", fontWeight: 500 }}>
                        {p.quantita}x
                      </td>
                      <td style={{ padding: "8px" }}>{p.nome}</td>
                      <td style={{ padding: "8px", color: "#666" }}>
                        {p.turno}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  justifyContent: "center",
                  marginTop: "20px",
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={sendToKitchen}
                  disabled={!comandaVisualizzata?.Piatti?.length}
                  style={{
                    flexBasis: "calc(50% - 10px)",
                    height: "45px",
                    minWidth: "140px",
                  }}
                >
                  Invia in Cucina
                </button>

                <button
                  className="btn btn-primary"
                  onClick={printComandaConRawBT}
                  disabled={!comandaVisualizzata?.Piatti?.length}
                  style={{
                    flexBasis: "calc(50% - 10px)",
                    height: "45px",
                    minWidth: "140px",
                  }}
                >
                  Stampa Scontrino
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setShowComandaVisualizzata(false)}
                  style={{
                    flexBasis: "100%",
                    height: "45px",
                    marginTop: "5px",
                    maxWidth: "300px",
                  }}
                >
                  Chiudi
                </button>
              </div>
            </div>
          ) : (
            /* ======= VISTA STANDARD (selezione piatti & azioni) ======= */
            <>
              {/* ───── Corpo principale ───── */}
              <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <label htmlFor="coperti" style={{ fontWeight: 600 }}>
                    Coperti:
                  </label>
                  <input
                    type="number"
                    id="coperti"
                    value={coperti}
                    onChange={(e) => setCoperti(e.target.value)}
                    min="1"
                    className="form-control"
                    style={{
                      width: "90px",
                      display: "inline-block",
                      marginLeft: "10px",
                    }}
                    required
                  />
                </div>

                <PiattiSelector onPiattiChange={handlePiattiChange} />

                {error && (
                  <p style={{ color: "red", marginTop: "12px" }}>{error}</p>
                )}
              </div>

              {/* ───── Footer con i pulsanti ───── */}
              <div
                style={{
                  borderTop: "1px solid #e5e5e5",
                  padding: "20px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="btn btn-secondary"
                  style={{ flexBasis: "calc(50% - 6px)", height: "45px" }}
                >
                  Annulla
                </button>

                <button
                  type="button"
                  onClick={salvaEChiudi}
                  disabled={isSaving || selectedPiatti.length === 0}
                  className="btn btn-primary"
                  style={{ flexBasis: "calc(50% - 6px)", height: "45px" }}
                >
                  {isSaving ? "Salvataggio..." : "Salva Comanda"}
                </button>

                <button
                  type="button"
                  onClick={printComandaConRawBT}
                  disabled={selectedPiatti.length === 0}
                  className="btn btn-primary"
                  style={{ flexBasis: "calc(50% - 6px)", height: "45px" }}
                >
                  Stampa Comanda
                </button>

                <button
                  type="button"
                  onClick={visualizzaComanda}
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{ flexBasis: "calc(50% - 6px)", height: "45px" }}
                >
                  Visualizza Comanda
                </button>

                <button
                  type="button"
                  onClick={sendToKitchen}
                  className="btn btn-primary"
                  style={{ flexBasis: "calc(50% - 6px)", height: "45px" }}
                >
                  Invia in Cucina
                </button>

                {/* placeholder extra */}
                <button
                  type="button"
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{ flexBasis: "calc(50% - 6px)", height: "45px" }}
                >
                  ---
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default ComandaModal;
