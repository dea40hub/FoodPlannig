import React, { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart, Clock } from "lucide-react";

// API call function (mantieni la tua logica esistente)
async function fetchCategorieEPiatti() {
  console.log("Fetching categorie e piatti...");
  
  const url = "https://vendoloapitest.dea40.it/api/test/getMenuCompletoPerFamiglia";
  
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const payload = {
    IdCompany: "4b848a8a-0f89-446d-bbd8-37468919f327",
    IdCategoria: "64198111-31AB-4772-8D30-08E26C502D9F",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Errore nella fetch: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  return json.menu;
}

function PiattiSelector({ onPiattiChange }) {
  const [categoriePiatti, setCategoriePiatti] = useState({});
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedPiatti, setSelectedPiatti] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchCategorieEPiatti();
        setCategoriePiatti(data);
        if (Object.keys(data).length > 0) {
          setSelectedCategoria(Object.keys(data)[0]);
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
    setSelectedPiatti((prev) => {
      const newState = { ...prev };
      if (checked) {
        newState[piatto.id] = {
          piattoId: piatto.ProductId,
          nome: piatto.nome,
          quantita: 1,
          turno: "T1",
          prezzo: piatto.Prezzo,
        };
      } else {
        delete newState[piatto.id];
      }
      onPiattiChange(Object.values(newState));
      return newState;
    });
  };

  const handleQuantitaChange = (piattoId, quantita) => {
    const q = Math.max(1, parseInt(quantita, 10));
    setSelectedPiatti((prev) => {
      const newState = {
        ...prev,
        [piattoId]: { ...prev[piattoId], quantita: q },
      };
      onPiattiChange(Object.values(newState));
      return newState;
    });
  };

  const handleTurnoChange = (piattoId, turno) => {
    setSelectedPiatti((prev) => {
      const newState = {
        ...prev,
        [piattoId]: { ...prev[piattoId], turno: turno },
      };
      onPiattiChange(Object.values(newState));
      return newState;
    });
  };

  const getTotalSelectedItems = () => {
    return Object.values(selectedPiatti).reduce((total, item) => total + item.quantita, 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-gray-600">Caricamento menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <div className="text-red-600 font-medium">Errore</div>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header con totale carrello */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          {getTotalSelectedItems() > 0 && (
            <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              <ShoppingCart size={16} className="mr-1" />
              <span className="text-sm font-medium">{getTotalSelectedItems()}</span>
            </div>
          )}
        </div>
        
        {/* Categorie scrollabili */}
        <div className="overflow-x-auto">
          <div className="flex space-x-2 px-4 pb-4">
            {Object.keys(categoriePiatti).map((categoria) => (
              <button
                key={categoria}
                onClick={() => setSelectedCategoria(categoria)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${selectedCategoria === categoria
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista piatti */}
      <div className="p-4">
        {selectedCategoria && categoriePiatti[selectedCategoria] ? (
          <div className="space-y-3">
            {categoriePiatti[selectedCategoria].map((piatto) => {
              const isSelected = !!selectedPiatti[piatto.id];
              const selectedItem = selectedPiatti[piatto.id];
              
              return (
                <div
                  key={piatto.id}
                  className={`
                    rounded-xl border transition-all duration-200
                    ${isSelected 
                      ? "border-blue-200 bg-blue-50 shadow-md" 
                      : "border-gray-200 bg-white hover:border-gray-300"
                    }
                  `}
                >
                  {/* Header del piatto */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 leading-tight">
                          {piatto.nome}
                        </h3>
                        {piatto.Prezzo && (
                          <p className="text-blue-600 font-semibold mt-1">
                            €{piatto.Prezzo.toFixed(2)}
                          </p>
                        )}
                      </div>
                      
                      {/* Toggle switch */}
                      <button
                        onClick={() => handlePiattoSelection(piatto, !isSelected)}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          ${isSelected ? "bg-blue-600" : "bg-gray-300"}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${isSelected ? "translate-x-6" : "translate-x-1"}
                          `}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Controlli (visibili solo se selezionato) */}
                  {isSelected && selectedItem && (
                    <div className="border-t border-blue-200 bg-white/50 p-4 space-y-4">
                      {/* Controllo quantità */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Quantità</span>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantitaChange(piatto.id, selectedItem.quantita - 1)}
                            disabled={selectedItem.quantita <= 1}
                            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={16} className="text-gray-600" />
                          </button>
                          
                          <span className="w-8 text-center font-semibold text-gray-900">
                            {selectedItem.quantita}
                          </span>
                          
                          <button
                            onClick={() => handleQuantitaChange(piatto.id, selectedItem.quantita + 1)}
                            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
                          >
                            <Plus size={16} className="text-white" />
                          </button>
                        </div>
                      </div>

                      {/* Selezione turno */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock size={16} className="text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700">Turno</span>
                        </div>
                        <select
                          value={selectedItem.turno}
                          onChange={(e) => handleTurnoChange(piatto.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="T1">T1</option>
                          <option value="T2">T2</option>
                          <option value="T3">T3</option>
                          <option value="T4">T4</option>
                          <option value="T5">T5</option>
                        </select>
                      </div>

                      {/* Subtotale se disponibile il prezzo */}
                      {piatto.Prezzo && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-sm font-medium text-gray-700">Subtotale</span>
                          <span className="font-semibold text-blue-600">
                            €{(piatto.Prezzo * selectedItem.quantita).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <ShoppingCart size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500">Seleziona una categoria per vedere i piatti</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PiattiSelector;
