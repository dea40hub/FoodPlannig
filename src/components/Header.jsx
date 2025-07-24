import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header({ userInfo }) {
  const [sessionData, setSessionData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Prima prova a recuperare i dati dalla nuova sessione (sessionStorage)
    const newSession = sessionStorage.getItem("userSession");
    if (newSession) {
      setSessionData(JSON.parse(newSession));
    } else {
      // Fallback: controlla il vecchio sistema (localStorage)
      const oldUser = localStorage.getItem("loggedInUser");
      if (oldUser) {
        // Crea un oggetto compatibile dal vecchio sistema
        setSessionData({
          nomeCompleto: oldUser,
          companyName: "Azienda",
          ruolo: "Cameriere",
          isLegacyUser: true, // Flag per sapere che è dal vecchio sistema
        });
      } else {
        // Se non c'è nessun utente loggato, reindirizza al login
        navigate("/");
      }
    }
  }, [navigate, userInfo]);

  const handleLogout = () => {
    // Conferma logout
    if (window.confirm("Sei sicuro di voler uscire?")) {
      // Pulisce TUTTI i dati di entrambi i sistemi (vecchio e nuovo)

      // Vecchio sistema (localStorage)
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("loggedInUserId");

      // Nuovo sistema (sessionStorage)
      sessionStorage.removeItem("userSession");
      sessionStorage.removeItem("currentCameriere");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("companyId");
      sessionStorage.removeItem("companyName");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("userRoles");

      // Reindirizza alla pagina di login
      navigate("/");
    }
  };

  // Usa i dati dalle props se disponibili, altrimenti usa sessionData
  const displayData = userInfo || sessionData;

  // Se non ci sono dati, mostra un loading o fallback
  if (!displayData) {
    return (
      <header className="sala-header">
        <div className="header-center">
          <h2 className="page-title">Caricamento...</h2>
        </div>
      </header>
    );
  }

  return (
    <header className="sala-header">
      <div className="header-left">
        <div className="company-info">
          <h1 className="company-name">
            {displayData.companyName || "Azienda"}
          </h1>
          <span className="system-info">Vendolo Gestione Ristorante</span>
        </div>
      </div>

      <div className="header-center">
        <h2 className="page-title">Gestione Sala</h2>
      </div>

      <div className="header-right">
        <div className="user-info">
          <div className="user-details">
            <span className="user-name">
              {displayData.nomeCompleto || displayData.nome || "Cameriere"}
            </span>
            <span className="user-role">
              ({displayData.ruolo || "Cameriere"})
              {displayData.isLegacyUser && (
                <span
                  className="legacy-indicator"
                  title="Utente dal vecchio sistema"
                >
                  *
                </span>
              )}
            </span>
          </div>
          <div className="datetime-info">
            <span className="current-date">
              {new Date().toLocaleDateString("it-IT")}
            </span>
            <span className="current-time">
              {new Date().toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <button
          className="logout-button"
          onClick={userInfo?.onLogout || handleLogout}
          title="Esci dall'applicazione"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17L21 12L16 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 12H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="logout-text">Esci</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
