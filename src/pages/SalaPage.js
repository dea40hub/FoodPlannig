import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TavoliGrid from '../components/TavoliGrid';
import ComandaModal from '../components/ComandaModal';

function SalaPage() {
  const [selectedTavolo, setSelectedTavolo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Funzione per gestire la selezione di un tavolo
  const handleSelectTavolo = (tavolo) => {
    setSelectedTavolo(tavolo);
    setIsModalOpen(true);
  };

  // Funzione per chiudere il modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTavolo(null); // Deseleziona il tavolo quando il modal si chiude
  };

  // Funzione chiamata dopo il salvataggio della comanda
  const handleSaveComanda = (comandaSalvata) => {
    console.log("Comanda salvata/aggiornata:", comandaSalvata);
    // Qui potresti voler aggiornare lo stato dei tavoli se necessario,
    // ma TavoliGrid si aggiorna già periodicamente
  };

  return (
    <div>
      <Header />
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

