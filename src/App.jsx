import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/login"; // Importa la nuova pagina di login
import SalaPage from "./pages/SalaPage";
import CucinaPage from "./pages/CucinaPage";
import CassaPage from "./pages/CassaPage";
import "./App.css";

// Costanti per i ruoli
const ROLES = {
  CAMERIERE: "cameriere",
  CASSA: "cassa"
};

function App() {
  // Funzione per verificare se l'utente è loggato
  const isAuthenticated = () => {
    try {
      return sessionStorage.getItem("currentCameriere") !== null;
    } catch (error) {
      console.error("Errore nel controllo dell'autenticazione:", error);
      return false;
    }
  };

  // Funzione per verificare il ruolo dell'utente
  const getUserRole = () => {
    try {
      const user = JSON.parse(sessionStorage.getItem("currentCameriere"));
      if (!user) return null;
      
      // Controlla sia il campo 'ruolo' che il nome per compatibilità
      if (user.ruolo) {
        return user.ruolo;
      }
      
      // Fallback per il controllo legacy basato sul nome
      return user.nome && user.nome.toLowerCase() === "cassa" ? ROLES.CASSA : ROLES.CAMERIERE;
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

  // Componente per reindirizzare l'utente loggato alla pagina corretta
  const RedirectIfLoggedIn = ({ children }) => {
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === ROLES.CASSA) {
        return <Navigate to="/cassa" replace />;
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
        
        <Route
          path="/cucina"
          element={
            <ProtectedRoute requiredRole={ROLES.CAMERIERE}>
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
        
        {/* Route di default e 404 */}
        <Route 
          path="/" 
          element={
            isAuthenticated() ? (
              getUserRole() === ROLES.CASSA ? (
                <Navigate to="/cassa" replace />
              ) : (
                <Navigate to="/sala" replace />
              )
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
