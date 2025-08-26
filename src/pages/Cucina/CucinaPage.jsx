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

      // Chiamata API per ottenere tutti gli ordini in cucina
      const response = await fetch(
        "https://vendoloapitest.dea40.it/api/test/getOrdiniCucina",
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

      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setOrdiniCucina(data.ordini || []);
        setLastUpdate(new Date());
      } else {
        throw new Error(data.message || "Errore nel caricamento ordini");
      }
    } catch (err) {
      console.error("Errore caricamento ordini cucina:", err);
      setError(err.message);

      // Dati di test in caso di errore API
      setOrdiniCucina(generateTestData());
    } finally {
      setLoading(false);
    }
  };

  // Genera dati di test per sviluppo
  const generateTestData = () => {
    return [
      {
        tavoloId: 1,
        numeroTavolo: "T01",
        coperti: 4,
        timestampOrdine: new Date(Date.now() - 15 * 60000).toISOString(),
        cameriere: "Mario Rossi",
        stato: "in_preparazione",
        piatti: [
          {
            id: 1,
            nome: "Spaghetti Carbonara",
            quantita: 2,
            turno: "T1",
            stato: "da_preparare",
            note: "Senza uova per allergia",
            timestampRichiesta: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: 2,
            nome: "Pizza Margherita",
            quantita: 1,
            turno: "T1",
            stato: "in_preparazione",
            note: "",
            timestampRichiesta: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: 3,
            nome: "Tiramisu'",
            quantita: 2,
            turno: "T3",
            stato: "da_preparare",
            note: "",
            timestampRichiesta: new Date(Date.now() - 15 * 60000).toISOString(),
          },
        ],
      },
      {
        tavoloId: 5,
        numeroTavolo: "T05",
        coperti: 2,
        timestampOrdine: new Date(Date.now() - 8 * 60000).toISOString(),
        cameriere: "Laura Bianchi",
        stato: "nuovo",
        piatti: [
          {
            id: 4,
            nome: "Risotto ai Funghi",
            quantita: 1,
            turno: "T1",
            stato: "da_preparare",
            note: "Extra parmigiano",
            timestampRichiesta: new Date(Date.now() - 8 * 60000).toISOString(),
          },
          {
            id: 5,
            nome: "Branzino al Sale",
            quantita: 1,
            turno: "T2",
            stato: "da_preparare",
            note: "",
            timestampRichiesta: new Date(Date.now() - 8 * 60000).toISOString(),
          },
        ],
      },
      {
        tavoloId: 8,
        numeroTavolo: "T08",
        coperti: 6,
        timestampOrdine: new Date(Date.now() - 5 * 60000).toISOString(),
        cameriere: "Giuseppe Verde",
        stato: "nuovo",
        piatti: [
          {
            id: 6,
            nome: "Antipasto Misto",
            quantita: 3,
            turno: "T1",
            stato: "da_preparare",
            note: "Senza salumi per tavolo 8",
            timestampRichiesta: new Date(Date.now() - 5 * 60000).toISOString(),
          },
          {
            id: 7,
            nome: "Orecchiette Cime di Rapa",
            quantita: 4,
            turno: "T2",
            stato: "da_preparare",
            note: "",
            timestampRichiesta: new Date(Date.now() - 5 * 60000).toISOString(),
          },
          {
            id: 8,
            nome: "Tagliata di Manzo",
            quantita: 2,
            turno: "T2",
            stato: "da_preparare",
            note: "Cottura media per entrambe",
            timestampRichiesta: new Date(Date.now() - 5 * 60000).toISOString(),
          },
        ],
      },
    ];
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

  // Cambia stato del piatto
  const cambiaStatoPiatto = async (tavoloId, piattoId, nuovoStato) => {
    try {
      const response = await fetch(
        "https://vendoloapitest.dea40.it/api/test/aggiornaStatoPiatto",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tavoloId,
            piattoId,
            stato: nuovoStato,
            timestampAggiornamento: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        // Aggiorna lo stato locale
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
      }
    } catch (err) {
      console.error("Errore aggiornamento stato piatto:", err);
    }
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

      {/* Toast notifications per feedback immediato */}
      {error && (
        <div className={styles.toastError}>
          ⚠️ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
    </div>
  );
}

export default CucinaPage;
