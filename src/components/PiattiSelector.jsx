import React, { useState, useEffect } from 'react';

// Placeholder: Simula chiamata API per ottenere categorie e piatti
async function fetchCategorieEPiatti_old() {
  console.log("Fetching categorie e piatti...");
  await new Promise(resolve => setTimeout(resolve, 300)); // Simula attesa API
  // Dati fittizi basati sullo schema DB
  return {
    Antipasti: [
      { id: 1, nome: 'Bruschette', categoria_id: 1 },
      { id: 2, nome: 'Prosciutto e Melone', categoria_id: 1 },
      { id: 3, nome: 'Caprese', categoria_id: 1 }
    ],
    Primi: [
      { id: 4, nome: 'Spaghetti al Pomodoro', categoria_id: 2 },
      { id: 5, nome: 'Lasagne alla Bolognese', categoria_id: 2 },
      { id: 6, nome: 'Risotto ai Funghi', categoria_id: 2 }
    ],
    Secondi: [
      { id: 7, nome: 'Bistecca ai Ferri', categoria_id: 3 },
      { id: 8, nome: 'Pollo alla Griglia', categoria_id: 3 },
      { id: 9, nome: 'Salmone al Forno', categoria_id: 3 }
    ],
    Pizze: [
      { id: 10, nome: 'Margherita', categoria_id: 4 },
      { id: 11, nome: 'Diavola', categoria_id: 4 },
      { id: 12, nome: 'Quattro Stagioni', categoria_id: 4 }
    ],
    Dolci: [
      { id: 13, nome: 'Tiramisù', categoria_id: 5 },
      { id: 14, nome: 'Panna Cotta', categoria_id: 5 }
    ],
    Bevande: [
      { id: 15, nome: 'Acqua Naturale', categoria_id: 6 },
      { id: 16, nome: 'Coca Cola', categoria_id: 6 },
      { id: 17, nome: 'Vino Rosso della Casa', categoria_id: 6 }
    ]
  };
}

// Placeholder: Simula chiamata API per ottenere categorie e piatti
async function fetchCategorieEPiatti() {
  console.log("Fetching categorie e piatti...");
  
  //const url = "http://localhost/VendoloApi/api/test/getMenuCompletoPerFamiglia";
  const url = "https://vendoloapi.dea40.it/api/test/getMenuCompletoPerFamiglia";

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

  const payload = {
    IdCompany: "591C7617-DF68-4C82-9EF0-7DEBF5C71DE4",
    IdCategoria: "64198111-31AB-4772-8D30-08E26C502D9F"
  };
  console.log("🔹 Payload inviato:", payload);

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
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
  const menuData = json.menu;
  console.log("📦 Menu ricevuto:", menuData);
  return menuData;
}

function PiattiSelector({ onPiattiChange }) {
  const [categoriePiatti, setCategoriePiatti] = useState({});
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedPiatti, setSelectedPiatti] = useState({}); // Oggetto per tracciare quantità e turno per piatto ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchCategorieEPiatti();
        setCategoriePiatti(data);
        if (Object.keys(data).length > 0) {
          setSelectedCategoria(Object.keys(data)[0]); // Seleziona la prima categoria di default
        }
        setError(null);
      } catch (err) {
        console.error("Errore nel caricamento delle categorie e piatti:", err);
        setError("Impossibile caricare il menu: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePiattoSelection = (piatto, checked) => {
    setSelectedPiatti(prev => {
      const newState = { ...prev };
      if (checked) {
        newState[piatto.id] = { piattoId: piatto.ProductId, nome: piatto.nome, quantita: 1, turno: 'T1' }; // Default a 1 e T1
      } else {
        delete newState[piatto.id];
      }
      onPiattiChange(Object.values(newState)); // Notifica il parent
      return newState;
    });
  };

  const handleQuantitaChange = (piattoId, quantita) => {
    const q = parseInt(quantita, 10);
    if (q >= 1) {
      setSelectedPiatti(prev => {
        const newState = { ...prev, [piattoId]: { ...prev[piattoId], quantita: q } };
        onPiattiChange(Object.values(newState));
        return newState;
      });
    }
  };

  const handleTurnoChange = (piattoId, turno) => {
    setSelectedPiatti(prev => {
      const newState = { ...prev, [piattoId]: { ...prev[piattoId], turno: turno } };
      onPiattiChange(Object.values(newState));
      return newState;
    });
  };

  if (loading) return <div className="text-center p-4">Caricamento menu...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div>
      <div className="categorie-container">
        {Object.keys(categoriePiatti).map(categoria => (
          <button
            key={categoria}
            onClick={() => setSelectedCategoria(categoria)}
            className={`categoria-btn ${selectedCategoria === categoria ? 'active' : ''}`}
          >
            {categoria}
          </button>
        ))}
      </div>

      <div className="piatti-container">
        {selectedCategoria && categoriePiatti[selectedCategoria] ? (
          <div className="space-y-3">
            {categoriePiatti[selectedCategoria].map(piatto => (
              <div key={piatto.id} className="piatto-item">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    id={`piatto-${piatto.id}`}
                    checked={!!selectedPiatti[piatto.id]}
                    onChange={(e) => handlePiattoSelection(piatto, e.target.checked)}
                    style={{ marginRight: '10px' }}
                  />
                  <label htmlFor={`piatto-${piatto.id}`}>{piatto.nome}</label>
                </div>
                {selectedPiatti[piatto.id] && (
                  <div className="piatto-controls">
                    <input
                      type="number"
                      min="1"
                      value={selectedPiatti[piatto.id].quantita}
                      onChange={(e) => handleQuantitaChange(piatto.id, e.target.value)}
                      style={{ width: '60px', textAlign: 'center' }}
                      className='form-control'
                    />
                    <select
                      value={selectedPiatti[piatto.id].turno}
                      onChange={(e) => handleTurnoChange(piatto.id, e.target.value)}
                      className='form-control'
                    >
                      <option value="T1">T1</option>
                      <option value="T2">T2</option>
                      <option value="T3">T3</option>
                      <option value="T4">T4</option>
                      <option value="T5">T5</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">Seleziona una categoria per vedere i piatti.</div>
        )}
      </div>
    </div>
  );
}

export default PiattiSelector;

