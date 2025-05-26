import React, { useState, useEffect } from "react";
import "./CassaPage.css"; // Creeremo questo file CSS
import TavoliGrid from "../components/TavoliGrid";

function CassaPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [selectedTable, setSelectedTable] = useState(null); // Aggiungere logica per selezionare tavolo
  const [showSala, setShowSala] = useState(false);
  const [showComandaModal, setShowComandaModal] = useState(false);

  const handleTavoloSelect = async (tavolo) => {
    console.log("Tavolo selezionato dalla cassa:", tavolo);
    setSelectedTable(tavolo);
    setShowSala(false);

    try {
      const url = `https://vendoloapitest.dea40.it/api/test/getComandaPerTavolo?idTavolo=${tavolo.id}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Errore nel recupero della comanda");
      }

      const json = await response.json();
      console.log("📦 Comanda ricevuta:", json);

      if (!json.Piatti || !json.Piatti.length) {
        alert("⚠️ Nessuna comanda presente per questo tavolo.");
        setCurrentOrder([]); // svuota ordine se non c'è nulla
        return;
      }

      // Trasforma la struttura in currentOrder
      const comanda = json.Piatti.map((p) => ({
        id: p.id || p.IdArticolo, // adattalo al tuo JSON
        nome: p.nome || p.NomeArticolo,
        quantity: p.quantita || p.Quantita,
        price: p.prezzo || p.PrezzoUnitario || 0,
      }));

      setCurrentOrder(comanda);
    } catch (err) {
      console.error("❌ Errore caricamento comanda:", err);
      alert("Errore durante il caricamento della comanda.");
    }
  };

  // // Simula il caricamento ordinazioni
  // useEffect(() => {
  //   if (!localStorage.getItem("categorie")) {
  //     localStorage.setItem(
  //       "categorie",
  //       JSON.stringify([
  //         { id: 1, nome: "Pizza" },
  //         { id: 2, nome: "Bevande" },
  //       ])
  //     );
  //   }

  //   if (!localStorage.getItem("piatti")) {
  //     localStorage.setItem(
  //       "piatti",
  //       JSON.stringify([
  //         { id: 101, nome: "Margherita", categoria_id: 1, prezzo: 6.5 },
  //         { id: 102, nome: "Coca Cola", categoria_id: 2, prezzo: 2.0 },
  //       ])
  //     );
  //   }
  // }, []);

  // Simula il caricamento di categorie e prodotti
  // useEffect(() => {
  //   // In un'applicazione reale, questi dati verrebbero caricati dal backend
  //   const loadedCategories =
  //     JSON.parse(localStorage.getItem("categorie")) || [];
  //   const loadedProducts = JSON.parse(localStorage.getItem("piatti")) || [];
  //   setCategories(loadedCategories);
  //   setProducts(loadedProducts);
  //   if (loadedCategories.length > 0) {
  //     setSelectedCategory(loadedCategories[0].id);
  //   }
  // }, []);

  useEffect(() => {
    async function loadMenu() {
      try {
        const menu = await fetchCategorieEPiatti();
        setCategories(Object.keys(menu));
        setProducts(menu); // 👈 Salvi tutto l’oggetto per poi filtrare
        if (Object.keys(menu).length > 0) {
          setSelectedCategory(Object.keys(menu)[0]);
        }
      } catch (err) {
        console.error("❌ Errore caricamento menu completo:", err);
      }
    }
    loadMenu();
  }, []);

  // useEffect(() => {
  //   async function loadPiattiPerCategoria() {
  //     if (!selectedCategory) return;
  //     try {
  //       const response = await fetch(
  //         `https://vendoloapitest.dea40.it/api/test/getPiattiPerCategoria?idCategoria=${selectedCategory}`
  //       );
  //       const json = await response.json();
  //       if (json.success && Array.isArray(json.data)) {
  //         setProducts(json.data);
  //       } else {
  //         setProducts([]);
  //       }
  //     } catch (err) {
  //       console.error("❌ Errore caricamento piatti:", err);
  //       setProducts([]);
  //     }
  //   }

  //   loadPiattiPerCategoria();
  // }, [selectedCategory]);

  // Calcola il totale dell'ordine ogni volta che cambia
  useEffect(() => {
    const total = currentOrder.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setOrderTotal(total);
  }, [currentOrder]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleProductClick = (product) => {
    const id = product.ProductId || product.id;
    const name = product.nome || product.NomeArticolo || "Prodotto";
    const price = product.Prezzo || product.prezzo || 0;

    setCurrentOrder((prevOrder) => {
      const existingItemIndex = prevOrder.findIndex((item) => item.id === id);
      if (existingItemIndex > -1) {
        const updatedOrder = [...prevOrder];
        updatedOrder[existingItemIndex].quantity += 1;
        return updatedOrder;
      } else {
        return [
          ...prevOrder,
          {
            id,
            nome: name, // 👈 importante per visualizzarlo
            price, // 👈 importante per visualizzarlo
            quantity: 1,
          },
        ];
      }
    });
  };

  const handleRemoveItem = (productId) => {
    setCurrentOrder((prevOrder) =>
      prevOrder.filter((item) => item.id !== productId)
    );
  };

  const handleQuantityChange = (productId, change) => {
    setCurrentOrder((prevOrder) => {
      const updatedOrder = prevOrder.map((item) => {
        if (item.id === productId) {
          const newQuantity = item.quantity + change;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }; // Minimo 1
        }
        return item;
      });
      return updatedOrder.filter((item) => item.quantity > 0); // Rimuovi se quantità è 0
    });
  };

  async function fetchCategorieEPiatti() {
    console.log("Fetching categorie e piatti...");

    //const url = "http://localhost/VendoloApi/api/test/getMenuCompletoPerFamiglia";
    const url =
      "https://vendoloapitest.dea40.it/api/test/getMenuCompletoPerFamiglia";

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
      IdCompany: "4b848a8a-0f89-446d-bbd8-37468919f327",
      IdCategoria: "64198111-31AB-4772-8D30-08E26C502D9F",
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

  // Filtra i prodotti per la categoria selezionata
  const filteredProducts =
    selectedCategory && products[selectedCategory]
      ? products[selectedCategory]
      : [];

  return (
    <div className="cassa-page">
      <header className="cassa-header">
        {/* Intestazione simile all'immagine */}
        <div className="header-left">VENDOLO.DEA40.IT</div>
        <div className="header-center">
          {/* Pulsanti Tavoli / Asporto */}
          <button className="btn" onClick={() => setShowSala(!showSala)}>
            {showSala ? "Chiudi Sala" : "Tavoli & Sale"}
          </button>
          <button className="btn">Asporto & Consegne</button>
        </div>
        <div className="header-right">
          <span>Operatore: Cassa</span> {/* Da rendere dinamico */}
          <span>
            {new Date().toLocaleDateString("it-IT")}{" "}
            {new Date().toLocaleTimeString("it-IT")}
          </span>
        </div>
      </header>

      <div className="cassa-body">
        <aside className="cassa-sidebar-left">
          {/* Pulsanti Conto Disponibile */}
          <button className="btn btn-conto">Conto 1 Disponibile</button>
          <button className="btn btn-conto">Conto 2 Disponibile</button>
          {/* Navigazione Categorie */}
          {/* <nav className="category-nav">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-button ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.nome}
              </button>
            ))}
          </nav> */}
          <nav className="category-nav">
            {categories.map((categoria) => (
              <button
                key={categoria}
                className={`category-button ${
                  selectedCategory === categoria ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(categoria)}
              >
                {categoria}
              </button>
            ))}
          </nav>
        </aside>

        <main className="cassa-main">
          {/* Tavoli visibili sempre */}
          <div className="tavoli-top-wrapper">
            <h2 className="section-title">Tavoli</h2>
            <TavoliGrid
              onSelectTavolo={handleTavoloSelect}
              selectedTable={selectedTable}
            />
          </div>

          {/* Divider */}
          <hr className="section-divider" />

          {/* Prodotti */}
          <div className="prodotti-wrapper">
            <h2 className="section-title">Prodotti</h2>
            {selectedTable ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    className="product-card"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="product-name">{product.nome}</div>
                    <div className="product-price">
                      € {(product.Prezzo || product.prezzo || 0).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#666",
                  marginTop: "1rem",
                }}
              >
                <em>Seleziona un tavolo per visualizzare i prodotti</em>
              </div>
            )}
          </div>
        </main>

        <aside className="cassa-sidebar-right">
          {selectedTable && (
            <div className="selected-table">
              Tavolo selezionato:{" "}
              <strong>{selectedTable.nome || selectedTable.numero}</strong>
            </div>
          )}
          {/* Riepilogo Ordine */}
          <div className="order-summary">
            <div className="order-total-display">€ {orderTotal.toFixed(2)}</div>
            <div className="order-details">
              <span>
                Pezzi:{" "}
                {currentOrder.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
              <span>Operatore: Cassa</span>
            </div>
            <ul className="order-items-list">
              {currentOrder.map((item) => (
                <li key={item.id} className="order-item">
                  <div className="item-info">
                    <span>
                      {item.quantity} x {item.nome}
                    </span>
                    <span>€ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => handleQuantityChange(item.id, 1)}>
                      +
                    </button>
                    <button onClick={() => handleQuantityChange(item.id, -1)}>
                      -
                    </button>
                    <button onClick={() => handleRemoveItem(item.id)}>
                      &times;
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* 🔹 Inserisci QUI il nuovo pulsante */}
            <button
              className="action-button"
              onClick={() => setShowComandaModal(true)}
            >
              Dettaglio Comanda
            </button>
          </div>
          {/* Tastierino Numerico e Pulsanti Azione */}
          <div className="keypad-actions">
            <div className="keypad">
              {/* Pulsanti 7-8-9, 4-5-6, 1-2-3, 0, . */}
              {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, "."].map((key) => (
                <button key={key} className="keypad-button">
                  {key}
                </button>
              ))}
              <button className="keypad-button">CL</button>
              <button className="keypad-button">BACK</button>
            </div>
            <div className="action-buttons">
              {/* Pulsanti Azione (Sconto, Chiudi, ecc.) */}
              <button className="action-button">Sconto</button>
              <button className="action-button">Chiudi Tavolo</button>
              <button className="action-button">Stampa Preconto</button>
              <button className="action-button">Scontrino</button>
              {/* ... altri pulsanti */}
            </div>
          </div>
        </aside>
      </div>

      <footer className="cassa-footer">
        {/* Pulsanti Funzione F1-F12 */}
        <button className="footer-button">Cassetto F2</button>
        <button className="footer-button">Operaz. Cassa F5</button>
        <button className="footer-button">Azzera Conto F6</button>
        <button className="footer-button">Annulla Art. F7</button>
        {/* ... altri pulsanti */}
      </footer>
      {showComandaModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowComandaModal(false)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowComandaModal(false);
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // 👈 blocca chiusura se clic dentro
          >
            <h3>Dettaglio Comanda Tavolo {selectedTable?.numero}</h3>
            <table className="modal-table">
              <thead>
                <tr>
                  <th>Q.tà</th>
                  <th>Articolo</th>
                  <th>Prezzo</th>
                  <th>Totale</th>
                </tr>
              </thead>
              <tbody>
                {currentOrder.map((item, index) => (
                  <tr key={index}>
                    <td>{item.quantity}</td>
                    <td>{item.nome}</td>
                    <td>€ {item.price.toFixed(2)}</td>
                    <td>€ {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: "right" }}>
                    Subtotale:
                  </td>
                  <td>
                    €{" "}
                    {currentOrder
                      .reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" style={{ textAlign: "right" }}>
                    Sconto:
                  </td>
                  <td>€ 0.00</td> {/* Puoi renderlo dinamico se vuoi */}
                </tr>
                <tr>
                  <td
                    colSpan="3"
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    Totale:
                  </td>
                  <td style={{ fontWeight: "bold" }}>
                    €{" "}
                    {currentOrder
                      .reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <button
              className="btn btn-primary"
              onClick={() => setShowComandaModal(false)}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CassaPage;
