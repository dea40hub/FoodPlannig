import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import TavoliGrid from "../components/TavoliGrid";
import ComandaModal from "../components/ComandaModal";

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