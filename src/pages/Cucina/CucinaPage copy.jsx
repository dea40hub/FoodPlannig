import React, { useState, useEffect } from "react";
import styles from "./cucina-styles.module.css";

function CucinaPage() {
  const [ordiniCucina, setOrdiniCucina] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [turnoAttivo, setTurnoAttivo] = useState("tutti");
  const [modalDettaglio, setModalDettaglio] = useState(null);
  const [userSession, setUserSession] = useState(null);

  // Recupera i dati dell'utente dalla sessione
  useEffect(() => {
    const session = sessionStorage.getItem("userSession");
    if (session) {
      setUserSession(JSON.parse(session));
    }
  }, []);

  // Funzione per il logout
  const handleLogout = () => {
    if (window.confirm("Sei sicuro di voler uscire?")) {
      sessionStorage.removeItem("userSession");
      sessionStorage.removeItem("currentCameriere");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("companyId");
      sessionStorage.removeItem("companyName");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("userRoles");

      window.location.href = "/login";
    }
  };

  // Polling automatico ogni 30 secondi
  useEffect(() => {
    loadOrdiniCucina();
    const interval = setInterval(loadOrdiniCucina, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrdiniCucina = async () => {
    try {
      setLoading(true);
      setError(null);

      // Chiamata API per ottenere tutti gli ordini in cucina
      const response = await fetch(
        "https://localhost:44327/api/test/getOrdiniCucina",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            IdCompany: "4b848a8a-0f89-446d-bbd8-37468919f327",
          }),
        }
      );

      console.log("🔹 Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Errore API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📦 Dati ricevuti:", data);

      if (data.success) {
        // Converte i timestamp per compatibilità con il codice esistente
        const ordiniFormattati = data.ordini.map(ordine => ({
          ...ordine,
          timestampOrdine: ordine.timestampOrdine,
          piatti: ordine.piatti.map(piatto => ({
            ...piatto,
            timestampRichiesta: piatto.timestampRichiesta
          }))
        }));

        setOrdiniCucina(ordiniFormattati);
        setLastUpdate(new Date());
        console.log("✅ Ordini caricati:", ordiniFormattati.length);
      } else {
        throw new Error(data.message || "Errore nel caricamento ordini");
      }
    } catch (err) {
      console.error("❌ Errore caricamento ordini cucina:", err);
      setError(err.message);

      // In caso di errore, mostra un messaggio invece di dati di test
      setOrdiniCucina([]);
    } finally {
      setLoading(false);
    }
  };

  // Cambia stato del piatto con chiamata API reale
  const cambiaStatoPiatto = async (tavoloId, piattoId, nuovoStato) => {
    try {
      console.log("🔄 Aggiornamento stato piatto:", { tavoloId, piattoId, nuovoStato });

      const response = await fetch(
        "https://localhost:44327/api/test/aggiornaStatoPiatto",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tavoloId: tavoloId,
            piattoId: piattoId,
            stato: nuovoStato,
            timestampAggiornamento: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Errore API: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Aggiorna lo stato locale solo se l'API ha avuto successo
        setOrdiniCucina((prev) =>
          prev.map((ordine) => {
            if (ordine.tavoloId === tavoloId) {
              return {
                ...ordine,
                piatti: ordine.piatti.map((piatto) => {
                  if (piatto.id === piattoId) {
                    return { ...piatto, stato: nuovoStato };
                  }
                  return piatto;
                }),
              };
            }
            return ordine;
          })
        );

        console.log("✅ Stato piatto aggiornato con successo");
        
        // Mostra feedback visivo
        const Toast = document.createElement('div');
        Toast.className = styles.toastSuccess || 'toast-success';
        Toast.innerHTML = `✅ Stato aggiornato: ${nuovoStato}`;
        Toast.style.cssText = `
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(39, 174, 96, 0.3);
          z-index: 1000;
          animation: slideInBottom 0.5s ease;
        `;
        document.body.appendChild(Toast);
        setTimeout(() => document.body.removeChild(Toast), 3000);
        
      } else {
        throw new Error(result.message || "Errore nell'aggiornamento dello stato");
      }
    } catch (err) {
      console.error("❌ Errore aggiornamento stato piatto:", err);
      setError(`Errore aggiornamento: ${err.message}`);
      
      // Mostra toast di errore
      const Toast = document.createElement('div');
      Toast.className = styles.toastError || 'toast-error';
      Toast.innerHTML = `❌ Errore: ${err.message}`;
      Toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(231, 76, 60, 0.3);
        z-index: 1000;
        animation: slideInBottom 0.5s ease;
      `;
      document.body.appendChild(Toast);
      setTimeout(() => document.body.removeChild(Toast), 5000);
    }
  };

  // Organizza i piatti per turno
  const organizzaPiattiPerTurno = () => {
    const piattiPerTurno = {
      T1: [],
      T2: [],
      T3: [],
      T4: [],
      T5: [],
    };

    ordiniCucina.forEach((ordine) => {
      ordine.piatti.forEach((piatto) => {
        if (piattiPerTurno[piatto.turno]) {
          piattiPerTurno[piatto.turno].push({
            ...piatto,
            tavolo: ordine.numeroTavolo,
            tavoloId: ordine.tavoloId,
            cameriere: ordine.cameriere,
            coperti: ordine.coperti,
            timestampOrdine: ordine.timestampOrdine,
          });
        }
      });
    });

    return piattiPerTurno;
  };

  // Calcola tempo trascorso
  const getTempoTrascorso = (timestamp) => {
    const now = new Date();
    const orderTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));

    if (diffMinutes < 1) return "Adesso";
    if (diffMinutes < 60) return `${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    return `${diffHours}h ${remainingMinutes}m`;
  };

  // Ottieni colore per stato
  const getStatoColor = (stato) => {
    switch (stato) {
      case "da_preparare":
        return styles.statoNuovo;
      case "in_preparazione":
        return styles.statoPreparazione;
      case "pronto":
        return styles.statoPronto;
      case "servito":
        return styles.statoServito;
      default:
        return styles.statoNuovo;
    }
  };

  // Ottieni priorita' basata sul tempo
  const getPriorita = (timestamp) => {
    const minuti = Math.floor((new Date() - new Date(timestamp)) / (1000 * 60));
    if (minuti > 30) return styles.prioritaAlta;
    if (minuti > 15) return styles.prioritaMedia;
    return "";
  };

  const piattiPerTurno = organizzaPiattiPerTurno();
  const turni = ["T1", "T2", "T3", "T4", "T5"];

  const ordiniFiltratti = turnoAttivo === "tutti" ? turni : [turnoAttivo];

  // Prepara i dati utente per l'header
  const headerUserData = userSession
    ? {
        nomeCompleto:
          userSession.nomeCompleto ||
          `${userSession.data?.user?.firstName || ""} ${
            userSession.data?.user?.lastName || ""
          }`.trim(),
        companyName: userSession.data?.user?.companyName || "",
        ruolo: userSession.ruoloSelezionato || "Operatore Cucina",
        email: userSession.data?.user?.email || "",
      }
    : {
        nomeCompleto: "Operatore",
        companyName: "Azienda",
        ruolo: "Operatore Cucina",
        email: "",
      };

  if (loading) {
    return (
      <div className={styles.cucinaPage}>
        <div className={styles.cucinaLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Caricamento ordini cucina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cucinaPage}>
      {/* Header Cucina con logout */}
      <header className={styles.cucinaHeader}>
        <div className={styles.headerLeft}>
          <h1>🔥 Gestione Cucina - {headerUserData.companyName}</h1>
          <div className={styles.headerStats}>
            <span>📋 {ordiniCucina.length} tavoli attivi</span>
            <span>
              🍽️ {ordiniCucina.reduce((sum, ord) => sum + ord.piatti.length, 0)}{" "}
              piatti
            </span>
          </div>
        </div>

        <div className="header-center">
          <div className={styles.turnoSelector}>
            <button
              className={`${styles.turnoBtn} ${
                turnoAttivo === "tutti" ? styles.active : ""
              }`}
              onClick={() => setTurnoAttivo("tutti")}
            >
              Tutti i Turni
            </button>
            {turni.map((turno) => (
              <button
                key={turno}
                className={`${styles.turnoBtn} ${
                  turnoAttivo === turno ? styles.active : ""
                }`}
                onClick={() => setTurnoAttivo(turno)}
              >
                {turno}
                <span className={styles.turnoCount}>
                  {
                    piattiPerTurno[turno].filter((p) => p.stato !== "servito")
                      .length
                  }
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{headerUserData.nomeCompleto}</span>
              <span className="user-role">({headerUserData.ruolo})</span>
            </div>
            <div className={styles.lastUpdate}>
              Ultimo aggiornamento: {lastUpdate.toLocaleTimeString("it-IT")}
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              className={styles.refreshBtn}
              onClick={loadOrdiniCucina}
              disabled={loading}
            >
              🔄 Aggiorna
            </button>
            <button
              className="logout-button"
              onClick={handleLogout}
              title="Esci dall'applicazione"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "rgba(220, 53, 69, 0.2)",
                border: "1px solid rgba(220, 53, 69, 0.5)",
                borderRadius: "6px",
                color: "#dc3545",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                outline: "none",
              }}
            >
              <span>→</span>
              <span>Esci</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenuto Principale */}
      <div className={styles.cucinaContent}>
        {error && (
          <div className={styles.errorBanner || 'error-banner'} style={{
            background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
            color: 'white',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            ⚠️ {error}
            <button 
              onClick={() => setError(null)}
              style={{
                marginLeft: '1rem',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {ordiniCucina.length === 0 && !loading && !error && (
          <div className={styles.nessunOrdine || 'nessun-ordine'} style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#7f8c8d',
            fontSize: '1.2rem',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
          }}>
            😴 Nessun ordine in cucina al momento
            <br />
            <small style={{ fontSize: '1rem', marginTop: '0.5rem', display: 'block' }}>
              Gli ordini appariranno qui quando i camerieri li invieranno in cucina
            </small>
          </div>
        )}

        {ordiniFiltratti.map((turno) => {
          const piattiTurno = piattiPerTurno[turno].filter(
            (p) => p.stato !== "servito"
          );

          if (piattiTurno.length === 0 && turnoAttivo !== "tutti") return null;

          return (
            <div key={turno} className={styles.turnoSection}>
              <div className={styles.turnoHeader}>
                <h2>
                  <span className={styles.turnoIcon}>
                    {turno === "T1" && "🥗"}
                    {turno === "T2" && "🍝"}
                    {turno === "T3" && "🥩"}
                    {turno === "T4" && "🍰"}
                    {turno === "T5" && "☕"}
                  </span>
                  TURNO {turno}
                  <span className={styles.piattiCount}>
                    ({piattiTurno.length} piatti)
                  </span>
                </h2>
              </div>

              <div className={styles.piattiGrid}>
                {piattiTurno
                  .sort(
                    (a, b) =>
                      new Date(a.timestampRichiesta) -
                      new Date(b.timestampRichiesta)
                  )
                  .map((piatto, index) => (
                    <div
                      key={`${piatto.tavoloId}-${piatto.id}`}
                      className={`${styles.piattoCard} ${getStatoColor(
                        piatto.stato
                      )} ${getPriorita(piatto.timestampRichiesta)}`}
                    >
                      <div className={styles.piattoHeader}>
                        <div className={styles.tavoloInfo}>
                          <span className={styles.tavoloNumero}>
                            {piatto.tavolo}
                          </span>
                          <span className={styles.tempoTrascorso}>
                            {getTempoTrascorso(piatto.timestampRichiesta)}
                          </span>
                        </div>
                        <div className={styles.quantitaBadge}>
                          {piatto.quantita}x
                        </div>
                      </div>

                      <div className={styles.piattoNome}>{piatto.nome}</div>

                      {piatto.note && (
                        <div className={styles.piattoNote}>
                          📝 {piatto.note}
                        </div>
                      )}

                      <div className={styles.piattoFooter}>
                        <div className={styles.cameriereInfo}>
                          👤 {piatto.cameriere}
                        </div>
                        <div className={styles.piattoActions}>
                          {piatto.stato === "da_preparare" && (
                            <button
                              className={`${styles.actionBtn} ${styles.startBtn}`}
                              onClick={() =>
                                cambiaStatoPiatto(
                                  piatto.tavoloId,
                                  piatto.id,
                                  "in_preparazione"
                                )
                              }
                            >
                              ▶️ Inizia
                            </button>
                          )}

                          {piatto.stato === "in_preparazione" && (
                            <button
                              className={`${styles.actionBtn} ${styles.readyBtn}`}
                              onClick={() =>
                                cambiaStatoPiatto(
                                  piatto.tavoloId,
                                  piatto.id,
                                  "pronto"
                                )
                              }
                            >
                              ✅ Pronto
                            </button>
                          )}

                          {piatto.stato === "pronto" && (
                            <button
                              className={`${styles.actionBtn} ${styles.servedBtn}`}
                              onClick={() =>
                                cambiaStatoPiatto(
                                  piatto.tavoloId,
                                  piatto.id,
                                  "servito"
                                )
                              }
                            >
                              🍽️ Servito
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {piattiTurno.length === 0 && (
                <div className={styles.turnoEmpty}>
                  ✨ Nessun piatto da preparare per questo turno
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Riepilogo in fondo */}
      <footer className={styles.cucinaFooter}>
        <div className={styles.footerStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Da Preparare:</span>
            <span className={`${styles.statValue} ${styles.statNuovo}`}>
              {ordiniCucina.reduce(
                (sum, ord) =>
                  sum +
                  ord.piatti.filter((p) => p.stato === "da_preparare").length,
                0
              )}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>In Preparazione:</span>
            <span className={`${styles.statValue} ${styles.statPreparazione}`}>
              {ordiniCucina.reduce(
                (sum, ord) =>
                  sum +
                  ord.piatti.filter((p) => p.stato === "in_preparazione")
                    .length,
                0
              )}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Pronti:</span>
            <span className={`${styles.statValue} ${styles.statPronto}`}>
              {ordiniCucina.reduce(
                (sum, ord) =>
                  sum + ord.piatti.filter((p) => p.stato === "pronto").length,
                0
              )}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CucinaPage;