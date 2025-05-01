import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SalaPage from './pages/SalaPage';
import CucinaPage from './pages/CucinaPage';
import CassaPage from './pages/CassaPage'; // Importa la nuova pagina Cassa
import './App.css';

function App() {
    // Funzione per verificare se l'utente è loggato (esempio)
    const isAuthenticated = () => {
        return sessionStorage.getItem('currentCameriere') !== null;
    };

    // Funzione per verificare il ruolo dell'utente (esempio)
    const getUserRole = () => {
        const user = JSON.parse(sessionStorage.getItem('currentCameriere'));
        // Assumiamo che l'utente 'cassa' abbia un ID specifico o un campo 'ruolo'
        // Qui usiamo un nome specifico per semplicità
        return user && user.nome.toLowerCase() === 'cassa' ? 'cassa' : 'cameriere';
    };

    // Componente protetto per le route
    const ProtectedRoute = ({ children, requiredRole }) => {
        if (!isAuthenticated()) {
            return <Navigate to="/login" replace />;
        }
        if (requiredRole && getUserRole() !== requiredRole) {
            // Se il ruolo è richiesto ma non corrisponde, reindirizza
            // Potresti reindirizzare a una pagina di accesso negato o alla pagina di default del ruolo
            // Per ora, reindirizziamo al login
            return <Navigate to="/login" replace />;
        }
        return children;
    };

    // Componente per reindirizzare l'utente loggato alla pagina corretta
    const RedirectIfLoggedIn = ({ children }) => {
        if (isAuthenticated()) {
            const role = getUserRole();
            if (role === 'cassa') {
                return <Navigate to="/cassa" replace />;
            }
            return <Navigate to="/sala" replace />;
        }
        return children;
    };

    return (
        <Router>
            <Routes>
                <Route 
                    path="/login" 
                    element={
                        <RedirectIfLoggedIn>
                            <LoginForm />
                        </RedirectIfLoggedIn>
                    }
                />
                <Route 
                    path="/sala" 
                    element={
                        <ProtectedRoute requiredRole="cameriere">
                            <SalaPage />
                        </ProtectedRoute>
                    }
                />
                <Route 
                    path="/cucina" 
                    element={
                        // Assumiamo che anche la cucina sia accessibile ai camerieri
                        // o potresti creare un ruolo 'cuoco'
                        <ProtectedRoute requiredRole="cameriere">
                            <CucinaPage />
                        </ProtectedRoute>
                    }
                />
                <Route 
                    path="/cassa" 
                    element={
                        <ProtectedRoute requiredRole="cassa">
                            <CassaPage />
                        </ProtectedRoute>
                    }
                />
                {/* Reindirizza alla pagina di login se nessuna route corrisponde o se l'utente non è loggato */}
                <Route 
                    path="*" 
                    element={<Navigate to="/login" replace />} 
                />
            </Routes>
        </Router>
    );
}

export default App;

