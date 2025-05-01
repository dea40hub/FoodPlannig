import React from 'react';
import Header from '../components/Header';
import OrdiniList from '../components/OrdiniList';

function CucinaPage() {
  return (
    <div>
      {/* Utilizza un Header generico o uno specifico per la cucina se necessario */}
      <header className="header">
        <h1>Visualizzazione Ordini Cucina</h1>
        {/* Potrebbe non esserci bisogno di logout qui, dipende dai requisiti */}
      </header>
      <div className="container">
        <OrdiniList />
      </div>
    </div>
  );
}

export default CucinaPage;

