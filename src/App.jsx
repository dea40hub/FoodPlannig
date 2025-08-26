import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/Login"; // Importa la nuova pagina di login
import SalaPage from "./pages/SalaPage";
import CucinaPage from "./pages/cucina/CucinaPage"; // Percorso corretto per CucinaPage
import CassaPage from "./pages/CassaPage";
import "./App.css";

// Costanti per i ruoli - AGGIUNTO CUCINA
const ROLES = {
  CAMERIERE: "cameriere",
  CASSA: "cassa",
  CUCINA: "cucina",
};

function App() {
  // Funzione per verificare se l'utente è loggato
  const isAuthenticated = () => {
    try {
      // Controlla sia il formato nuovo che quello legacy
      return (
        sessionStorage.getItem("userSession") !== null ||
        sessionStorage.getItem("currentCameriere") !== null
      );
    } catch (error) {
      console.error("Errore nel controllo dell'autenticazione:", error);
      return false;
    }
  };

  // Funzione per verificare il ruolo dell'utente - AGGIORNATA
  const getUserRole = () => {
    try {
      // Prima prova a leggere dal nuovo formato userSession
      const userSession = sessionStorage.getItem("userSession");
      if (userSession) {
        const session = JSON.parse(userSession);
        return session.ruoloSelezionato; // cameriere, cassa, o cucina
      }

      // Fallback per il formato legacy
      const user = JSON.parse(sessionStorage.getItem("currentCameriere"));
      if (!user) return null;

      // Controlla sia il campo 'ruolo' che il nome per compatibilità
      if (user.ruolo) {
        return user.ruolo;
      }

      // Fallback per il controllo legacy basato sul nome
      return user.nome && user.nome.toLowerCase() === "cassa"
        ? ROLES.CASSA
        : ROLES.CAMERIERE;
    } catch (error) {
      console.error("Errore nel parsing dell'utente:", error);
      return null;
    }
  };

  // Componente protetto per le route
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
      const userRole = getUserRole();
      if (!userRole || userRole !== requiredRole) {
        // Reindirizza alla pagina di login se il ruolo non corrisponde
        sessionStorage.clear(); // Pulisce la sessione per sicurezza
        return <Navigate to="/login" replace />;
      }
    }

    return children;
  };

  // Componente per reindirizzare l'utente loggato alla pagina corretta - AGGIORNATO
  const RedirectIfLoggedIn = ({ children }) => {
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === ROLES.CASSA) {
        return <Navigate to="/cassa" replace />;
      }
      if (role === ROLES.CUCINA) {
        return <Navigate to="/cucina" replace />;
      }
      if (role === ROLES.CAMERIERE) {
        return <Navigate to="/sala" replace />;
      }
      // Se il ruolo non è riconosciuto, pulisce la sessione
      sessionStorage.clear();
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Route di login */}
        <Route
          path="/login"
          element={
            <RedirectIfLoggedIn>
              <LoginPage />
            </RedirectIfLoggedIn>
          }
        />

        {/* Route per camerieri */}
        <Route
          path="/sala"
          element={
            <ProtectedRoute requiredRole={ROLES.CAMERIERE}>
              <SalaPage />
            </ProtectedRoute>
          }
        />

        {/* Route per operatori di cucina - CORRETTA */}
        <Route
          path="/cucina"
          element={
            <ProtectedRoute requiredRole={ROLES.CUCINA}>
              <CucinaPage />
            </ProtectedRoute>
          }
        />

        {/* Route per operatori di cassa */}
        <Route
          path="/cassa"
          element={
            <ProtectedRoute requiredRole={ROLES.CASSA}>
              <CassaPage />
            </ProtectedRoute>
          }
        />

        {/* Route di default e 404 - AGGIORNATA */}
        <Route
          path="/"
          element={
            isAuthenticated() ? (
              (() => {
                const role = getUserRole();
                switch (role) {
                  case ROLES.CASSA:
                    return <Navigate to="/cassa" replace />;
                  case ROLES.CUCINA:
                    return <Navigate to="/cucina" replace />;
                  case ROLES.CAMERIERE:
                  default:
                    return <Navigate to="/sala" replace />;
                }
              })()
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback per route non esistenti */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
