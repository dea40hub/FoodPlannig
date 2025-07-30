import React, { useState, useEffect } from "react";
import "./CassaPage.css";
import TavoliGrid from "../components/TavoliGrid";
import vendoloLogo from "../assets/logo-vendolo-200.png";

function CassaPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showSala, setShowSala] = useState(false);
  const [showComandaModal, setShowComandaModal] = useState(false);
  const [showAnagraficaModal, setShowAnagraficaModal] = useState(false);
  const [showScontrinoModal, setShowScontrinoModal] = useState(false);
  const [showFatturaModal, setShowFatturaModal] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [formData, setFormData] = useState({
    tipoCliente: "Privato",
    partitaIva: "",
    cliente: true,
    fornitore: false,
    cognome: "",
    nome: "",
    indirizzo: "",
    regione: "",
    provincia: "",
    citta: "",
    cap: "",
    telefono: "",
    email: "",
    codiceFiscale: "",
    pec: "",
    sdi: "",
    iban: "",
  });

  const [isEmettendoScontrino, setIsEmettendoScontrino] = useState(false);
  const [tipoPagamento, setTipoPagamento] = useState("contanti");

  // Recupera i dati dell'utente dalla sessione
  useEffect(() => {
    const session = sessionStorage.getItem("userSession");
    if (session) {
      setUserSession(JSON.parse(session));
    }
  }, []);

  // Funzione per il logout
  const handleLogout = () => {
    // Conferma logout
    if (window.confirm("Sei sicuro di voler uscire?")) {
      // Pulisce tutti i dati della sessione
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
      window.location.href = "/login"; // Oppure navigate('/login') se usi React router
    }
  };

  const handleFakePartitaIvaSearch = () => {
    const fakeResponse = {
      tipoCliente: "Azienda",
      cognome: "",
      nome: "MediaLab Srl",
      indirizzo: "Via Roma 123",
      regione: "Puglia",
      provincia: "LE",
      citta: "Lecce",
      cap: "73100",
      telefono: "0832123456",
      email: "info@medialab.it",
      codiceFiscale: "01234567890",
      partitaIva: formData.partitaIva,
      pec: "pec@medialab.it",
      sdi: "ABC1234",
      iban: "IT60X0542811101000000123456",
    };

    setFormData((prev) => ({ ...prev, ...fakeResponse }));
  };

  // Funzione per emettere lo scontrino
  const handleEmettiScontrino = async () => {
  setIsEmettendoScontrino(true);

  try {
    const authToken = sessionStorage.getItem("authToken");
    if (!authToken) {
      alert("Token di autenticazione non trovato. Effettua nuovamente il login.");
      return;
    }

    if (currentOrder.length === 0) {
      alert("Nessun articolo da emettere nello scontrino.");
      return;
    }

    // Calcola i pagamenti in base alla selezione
    const pagamentoContante = tipoPagamento === "contanti" ? orderTotal : 0;
    const pagamentoElettronico = tipoPagamento === "elettronico" ? orderTotal : 0;

    // Prepara il payload per l'emissione scontrino
    const payloadScontrino = {
      tokenAPI: "TJd7UH0aVPsDEUEMP8MC8VH7udfSiQgAXaXRkaqdioOOam7aGh9hmER7gxRJ859s",
      idSede: "FFBF96AE-ED56-47B1-BBDA-70DC24C74321",
      scontrino: {
        dettaglio: currentOrder.map((item) => ({
          codiceIva: "22",
          descrizione: item.nome,
          prezzo: item.price,
          quantita: item.quantity,
          codiceArticolo: "",
          valoresconto: 0,
          omaggio: false,
        })),
        oid: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
        numero: 0,
        etichetta: selectedTable ? `Tavolo ${selectedTable.nome || selectedTable.numero}` : "",
        codiceFiscale: "",
        pagamentoContante: pagamentoContante,
        pagamentoElettronico: pagamentoElettronico,
        pagamentoTicket: 0,
        numeroTicket: 0,
        scontoAbbuono: 0,
        nonRiscossoPrestazioni: 0,
        nonRiscossoCredito: 0,
        codiceLotteria: "",
      },
    };

    console.log("📤 Invio scontrino:", payloadScontrino);

    // Chiamata API per emettere lo scontrino
    const response = await fetch("https://apiwhrtest.dea40.it/api/Scontrino/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payloadScontrino),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Errore HTTP:", response.status, errorText);

      switch (response.status) {
        case 401:
          alert("Token di autenticazione scaduto. Effettua nuovamente il login.");
          break;
        case 403:
          alert("Non hai i permessi per emettere scontrini.");
          break;
        case 400:
          alert("Dati dello scontrino non validi. Controlla gli articoli.");
          break;
        case 500:
          alert("Errore del server. Riprova più tardi.");
          break;
        default:
          alert(`Errore durante l'emissione: ${response.status}`);
      }
      return;
    }

    // Processa la risposta di successo
    const scontrinoResult = await response.json();
    console.log("✅ Scontrino emesso:", scontrinoResult);

    if (scontrinoResult.success) {
      // **NUOVA PROCEDURA DI SALVATAGGIO**
      // Prepara i dati per il salvataggio nel database
      const payloadSalvataggio = preparaPayloadSalvataggio(
        payloadScontrino, 
        scontrinoResult, 
        selectedTable, 
        userSession
      );
      
      // Chiama l'API di salvataggio (non blocca se fallisce)
      const salvataggioreResult = await salvaScontrino(payloadSalvataggio);
      
      // Mostra messaggio di successo
      const numeroScontrino = scontrinoResult.data?.progressivo || scontrinoResult.data?.numeroScontrino || "N/A";
      const tipoPagamentoText = tipoPagamento === "contanti" ? "Contanti" : "Elettronico";
      
      let messaggioSuccesso = `✅ Scontrino emesso con successo!\nNumero: ${numeroScontrino}\nPagamento: ${tipoPagamentoText}`;
      
      // Aggiungi info sul salvataggio se disponibile
      if (salvataggioreResult?.success) {
        messaggioSuccesso += "\n📁 Dati salvati nel sistema";
      } else if (salvataggioreResult?.error) {
        messaggioSuccesso += "\n⚠️ Errore salvataggio dati (scontrino comunque emesso)";
      }

      alert(messaggioSuccesso);

      // Pulisce l'ordine corrente dopo emissione
      setCurrentOrder([]);
      setOrderTotal(0);

      // Chiude il modal
      setShowScontrinoModal(false);
      
      // Opzionale: Potresti anche impostare lo stato del tavolo come "da chiudere"
      // setSelectedTable(prev => ({ ...prev, stato: "da_chiudere" }));
      
    } else {
      alert(`⚠️ Problema nell'emissione: ${scontrinoResult.message || "Errore sconosciuto"}`);
    }
  } catch (error) {
    console.error("❌ Errore durante emissione scontrino:", error);

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      alert("Errore di connessione. Controlla la connessione internet.");
    } else {
      alert(`Errore imprevisto: ${error.message}`);
    }
  } finally {
    setIsEmettendoScontrino(false);
  }
};


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
        setCurrentOrder([]);
        return;
      }

      const comanda = json.Piatti.map((p) => ({
        id: p.id || p.IdArticolo,
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

  useEffect(() => {
    async function loadMenu() {
      try {
        const menu = await fetchCategorieEPiatti();
        setCategories(Object.keys(menu));
        setProducts(menu);
        if (Object.keys(menu).length > 0) {
          setSelectedCategory(Object.keys(menu)[0]);
        }
      } catch (err) {
        console.error("❌ Errore caricamento menu completo:", err);
      }
    }
    loadMenu();
  }, []);

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
            nome: name,
            price,
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
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      });
      return updatedOrder.filter((item) => item.quantity > 0);
    });
  };

  async function fetchCategorieEPiatti() {
    console.log("Fetching categorie e piatti...");

    const url =
      "https://vendoloapitest.dea40.it/api/test/getMenuCompletoPerFamiglia";

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
      throw new Error(
        `Errore nella fetch: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();
    const menuData = json.menu;
    return menuData;
  }

  const handleInviaFattura = () => {
    alert("Fattura inviata con successo!");
  };

  const handleStampaProforma = () => {
    window.print();
  };

  const filteredProducts =
    selectedCategory && products[selectedCategory]
      ? products[selectedCategory]
      : [];

  // Prepara i dati utente per l'header
  const headerUserData = userSession
    ? {
        nomeCompleto:
          userSession.nomeCompleto ||
          `${userSession.data?.user?.firstName || ""} ${
            userSession.data?.user?.lastName || ""
          }`.trim(),
        companyName: userSession.data?.user?.companyName || "",
        ruolo: userSession.ruoloSelezionato || "Operatore Cassa",
        email: userSession.data?.user?.email || "",
      }
    : {
        nomeCompleto: "Operatore",
        companyName: "Azienda",
        ruolo: "Operatore Cassa",
        email: "",
      };

  // Preparo i dati per il salvataggio dello scontrino
  const preparaPayloadSalvataggio = (
    originalPayload,
    scontrinoResponse,
    selectedTable,
    userSession
  ) => {
    const payloadSalvataggio = {
      // Dati della transazione
      transazione: {
        idTransazione: scontrinoResponse.data?.idtrx || "",
        progressivo: scontrinoResponse.data?.progressivo || "",
        dataEmissione: scontrinoResponse.data?.data || new Date().toISOString(),
        totale: scontrinoResponse.data?.totale || 0,
        numeroScontrino: scontrinoResponse.data?.progressivo || "",
      },

      // Payload originale della richiesta scontrino
      payloadOriginale: {
        tokenAPI: originalPayload.tokenAPI,
        idSede: originalPayload.idSede,
        scontrino: originalPayload.scontrino,
      },

      // Response completa dell'API scontrino
      responseScontrino: {
        success: scontrinoResponse.success,
        message: scontrinoResponse.message,
        data: scontrinoResponse.data,
        errors: scontrinoResponse.errors || [],
        timestamp: scontrinoResponse.timestamp,
      },

      // Dati del tavolo
      tavolo: {
        id: selectedTable?.id || "",
        nome: selectedTable?.nome || "",
        numero: selectedTable?.numero || "",
        stato: "da_chiudere", // Indica che il tavolo deve essere chiuso
      },

      // Dati dell'operatore
      operatore: {
        nomeCompleto:
          userSession?.nomeCompleto ||
          `${userSession?.data?.user?.firstName || ""} ${
            userSession?.data?.user?.lastName || ""
          }`.trim(),
        email: userSession?.data?.user?.email || "",
        companyName: userSession?.data?.user?.companyName || "",
        ruolo: userSession?.ruoloSelezionato || "Operatore Cassa",
        userId: userSession?.data?.user?.id || "",
      },

      // Metadati
      metadati: {
        timestampElaborazione: new Date().toISOString(),
        tipoOperazione: "emissione_scontrino",
        versione: "1.0",
      },
    };

    return payloadSalvataggio;
  };

  // Chiamata API per salvataggio scontrino

const salvaScontrino = async (payloadSalvataggio) => {
  try {
    const authToken = sessionStorage.getItem("authToken");
    
    console.log("📤 Invio dati salvataggio scontrino:", payloadSalvataggio);
    
    // URL corretto per il progetto VendoloApi
    const response = await fetch("https://vendoloapitest.dea40.it/api/test/salvaScontrino", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payloadSalvataggio),
    });

    if (!response.ok) {
      throw new Error(`Errore salvataggio: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ Scontrino salvato nel database:", result);
    
    return result;
  } catch (error) {
    console.error("❌ Errore durante il salvataggio dello scontrino:", error);
    // Non bloccare il flusso principale, solo logga l'errore
    return { success: false, error: error.message };
  }
};

  return (
    <div className="cassa-page">
      <header className="cassa-header">
        {/* Intestazione aggiornata con dati reali */}
        <div className="header-left">
          <div className="company-info">
            <strong>{headerUserData.companyName}</strong>
            <small>VENDOLO.DEA40.IT</small>
          </div>
        </div>
        <div className="header-center">
          <button className="btn" onClick={() => setShowSala(!showSala)}>
            {showSala ? "Chiudi Sala" : "Tavoli & Sale"}
          </button>
          <button className="btn">Asporto & Consegne</button>
          <button className="btn" onClick={() => setShowAnagraficaModal(true)}>
            Anagrafica Clienti
          </button>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{headerUserData.nomeCompleto}</span>
              <span className="user-role">({headerUserData.ruolo})</span>
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
            onClick={handleLogout}
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

      <div className="cassa-body">
        <aside className="cassa-sidebar-left">
          <button className="btn btn-conto">Conto 1 Disponibile</button>
          <button className="btn btn-conto">Conto 2 Disponibile</button>
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
          <div className="tavoli-top-wrapper">
            <h2 className="section-title">Tavoli</h2>
            <TavoliGrid
              onSelectTavolo={handleTavoloSelect}
              selectedTable={selectedTable}
            />
          </div>

          <hr className="section-divider" />

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
          <div className="order-summary">
            <div className="order-total-display">€ {orderTotal.toFixed(2)}</div>
            <div className="order-details">
              <span>
                Pezzi:{" "}
                {currentOrder.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
              <span>Operatore: {headerUserData.nomeCompleto}</span>
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

            <button
              className="action-button"
              onClick={() => setShowComandaModal(true)}
            >
              Dettaglio Comanda
            </button>
          </div>

          <div className="keypad-actions">
            <div className="keypad">
              {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, "."].map((key) => (
                <button key={key} className="keypad-button">
                  {key}
                </button>
              ))}
              <button className="keypad-button">CL</button>
              <button className="keypad-button">BACK</button>
            </div>
            {/* NUOVO BOX TIPO PAGAMENTO */}
            <div className="tipo-pagamento-box">
              <h4 className="tipo-pagamento-title">Tipo Pagamento</h4>
              <div className="tipo-pagamento-options">
                <label className="tipo-pagamento-option">
                  <input
                    type="radio"
                    name="tipoPagamento"
                    value="contanti"
                    checked={tipoPagamento === "contanti"}
                    onChange={(e) => setTipoPagamento(e.target.value)}
                  />
                  <span className="tipo-pagamento-icon">💵</span>
                  <span className="tipo-pagamento-label">Contanti</span>
                </label>

                <label className="tipo-pagamento-option">
                  <input
                    type="radio"
                    name="tipoPagamento"
                    value="elettronico"
                    checked={tipoPagamento === "elettronico"}
                    onChange={(e) => setTipoPagamento(e.target.value)}
                  />
                  <span className="tipo-pagamento-icon">💳</span>
                  <span className="tipo-pagamento-label">Elettronico</span>
                </label>
              </div>
            </div>
            <div className="action-buttons">
              <button className="action-button">Sconto</button>
              <button className="action-button">Chiudi Tavolo</button>
              <button
                className="action-button"
                onClick={() => setShowFatturaModal(true)}
              >
                Fattura
              </button>
              <button
                className="action-button"
                onClick={() => setShowScontrinoModal(true)}
              >
                Scontrino
              </button>
            </div>
          </div>
        </aside>
      </div>

      <footer className="cassa-footer">
        <button className="footer-button">Cassetto F2</button>
        <button className="footer-button">Operaz. Cassa F5</button>
        <button className="footer-button">Azzera Conto F6</button>
        <button className="footer-button">Annulla Art. F7</button>
      </footer>

      {/* MODALI - Rimangono identici al tuo codice originale */}
      {showFatturaModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFatturaModal(false)}
        >
          <div
            className="modal-content-fattura"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fattura-container fattura-stampa-area">
              <div className="fattura-intestazioni">
                <div className="intestazione-azienda">
                  <h2>{headerUserData.companyName}</h2>
                  <p>P.IVA 01234567890</p>
                  <p>Via Roma 123 – 73100 Lecce (LE)</p>
                </div>
                <div className="intestazione-cliente">
                  <p>
                    <strong>Cliente Demo</strong>
                  </p>
                  <p>P.IVA 00000000000</p>
                  <p>Via Cliente, 1 - Città</p>
                </div>
              </div>

              <h4 style={{ marginTop: 30 }}>Fattura proforma</h4>
              <p>
                Num. provv. 1/{new Date().getFullYear()} del{" "}
                {new Date().toLocaleDateString()}
              </p>

              <table className="fattura-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Dettaglio</th>
                    <th>Q.tà</th>
                    <th>Prezzo unitario</th>
                    <th>Importo</th>
                    <th>IVA</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.nome}</td>
                      <td>{item.quantity}</td>
                      <td>€ {item.price.toFixed(2)}</td>
                      <td>€ {(item.price * item.quantity).toFixed(2)}</td>
                      <td>22%</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="fattura-totali">
                <p>Imponibile: € {orderTotal.toFixed(2)}</p>
                <p>IVA 22%: € {(orderTotal * 0.22).toFixed(2)}</p>
                <p>
                  <strong>Totale: € {(orderTotal * 1.22).toFixed(2)}</strong>
                </p>
              </div>

              <div className="fattura-pagamento">
                <h4>Modalità pagamento</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Metodo</th>
                      <th>IBAN</th>
                      <th>Scadenza</th>
                      <th>Importo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Bonifico</td>
                      <td>IT00X0000000000000000000000</td>
                      <td>30/06/{new Date().getFullYear()}</td>
                      <td>€ {(orderTotal * 1.22).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="fattura-actions no-print">
              <button
                className="fattura-button"
                onClick={() => setShowFatturaModal(false)}
              >
                Chiudi Anteprima
              </button>
              <button
                className="fattura-button green"
                onClick={handleInviaFattura}
              >
                Invia Fattura
              </button>
              <button
                className="fattura-button purple"
                onClick={handleStampaProforma}
              >
                Stampa Proforma
              </button>
            </div>
          </div>
        </div>
      )}

      {showScontrinoModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowScontrinoModal(false)}
        >
          <div
            className="modal-content-scontrino"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="scontrino-container">
              <div className="scontrino-logo">
                <img src={vendoloLogo} alt="Logo" style={{ width: 80 }} />
              </div>

              <h3 className="scontrino-title">{headerUserData.companyName}</h3>
              <p>Via Roma 123 – 73100 Lecce</p>
              <p>P.IVA 01234567890</p>
              <p>Tel. 0832 123456</p>

              <h4 style={{ marginTop: 20 }}>DOCUMENTO COMMERCIALE</h4>

              <table className="scontrino-table">
                <thead>
                  <tr>
                    <th>Q.tà</th>
                    <th>Descrizione</th>
                    <th>Prezzo</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.map((item, index) => (
                    <tr key={index}>
                      <td>{item.quantity}</td>
                      <td>{item.nome}</td>
                      <td>€ {item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="scontrino-totale">
                <strong>TOTALE: € {orderTotal.toFixed(2)}</strong>
              </div>

              {/* Mostra il tipo di pagamento selezionato */}
              <div className="scontrino-pagamento-info">
                <p
                  style={{
                    margin: "15px 0 5px 0",
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  <strong>
                    PAGAMENTO:{" "}
                    {tipoPagamento === "contanti"
                      ? "💵 CONTANTI"
                      : "💳 ELETTRONICO"}
                  </strong>
                </p>
              </div>

              <div className="scontrino-footer">
                <p>Trans. n. 1</p>
                <p>TS DCW2025/9345-9669</p>
                <p>{new Date().toLocaleString("it-IT")}</p>
                <p>DOCUMENTO N. 1/{new Date().toISOString().slice(0, 10)}</p>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => setShowScontrinoModal(false)}
                style={{ marginTop: 20 }}
              >
                Chiudi Anteprima
              </button>

              <button
                className="btn btn-primary"
                onClick={handleEmettiScontrino}
                disabled={isEmettendoScontrino || currentOrder.length === 0}
                style={{
                  marginTop: 10,
                  backgroundColor: isEmettendoScontrino ? "#6c757d" : "#28a745",
                  cursor:
                    isEmettendoScontrino || currentOrder.length === 0
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    isEmettendoScontrino || currentOrder.length === 0 ? 0.6 : 1,
                }}
              >
                {isEmettendoScontrino ? (
                  <>
                    <span>Emettendo...</span>
                    <div
                      style={{
                        display: "inline-block",
                        marginLeft: "8px",
                        width: "12px",
                        height: "12px",
                        border: "2px solid #ffffff",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    ></div>
                  </>
                ) : (
                  "🧾 Emetti Scontrino"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAnagraficaModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAnagraficaModal(false)}
        >
          <div
            className="modal-content modal-anagrafica"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Anagrafica Cliente / Fornitore</h3>

            <form className="anagrafica-form">
              <label>
                Tipo Cliente:
                <select
                  value={formData.tipoCliente}
                  onChange={(e) =>
                    setFormData({ ...formData, tipoCliente: e.target.value })
                  }
                >
                  <option value="Privato">Privato</option>
                  <option value="Azienda">Azienda</option>
                </select>
              </label>

              <label>
                Partita IVA:
                <input
                  type="text"
                  placeholder="IT01234567890"
                  value={formData.partitaIva}
                  onChange={(e) =>
                    setFormData({ ...formData, partitaIva: e.target.value })
                  }
                />
              </label>

              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleFakePartitaIvaSearch}
                >
                  CERCA
                </button>
              </div>

              <label>
                Cliente:
                <input
                  type="checkbox"
                  checked={formData.cliente}
                  onChange={(e) =>
                    setFormData({ ...formData, cliente: e.target.checked })
                  }
                />
              </label>

              <label>
                Fornitore:
                <input
                  type="checkbox"
                  checked={formData.fornitore}
                  onChange={(e) =>
                    setFormData({ ...formData, fornitore: e.target.checked })
                  }
                />
              </label>
              <div></div>

              <input
                type="text"
                placeholder="Cognome"
                value={formData.cognome}
                onChange={(e) =>
                  setFormData({ ...formData, cognome: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Indirizzo"
                value={formData.indirizzo}
                onChange={(e) =>
                  setFormData({ ...formData, indirizzo: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Regione"
                value={formData.regione}
                onChange={(e) =>
                  setFormData({ ...formData, regione: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Provincia"
                value={formData.provincia}
                onChange={(e) =>
                  setFormData({ ...formData, provincia: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Città"
                value={formData.citta}
                onChange={(e) =>
                  setFormData({ ...formData, citta: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="CAP"
                value={formData.cap}
                onChange={(e) =>
                  setFormData({ ...formData, cap: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Telefono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Codice Fiscale"
                value={formData.codiceFiscale}
                onChange={(e) =>
                  setFormData({ ...formData, codiceFiscale: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="PEC"
                value={formData.pec}
                onChange={(e) =>
                  setFormData({ ...formData, pec: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Codice SDI"
                value={formData.sdi}
                onChange={(e) =>
                  setFormData({ ...formData, sdi: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="IBAN"
                value={formData.iban}
                onChange={(e) =>
                  setFormData({ ...formData, iban: e.target.value })
                }
              />
              <div></div>

              <div className="form-actions">
                <button className="btn-primary" type="submit">
                  SALVA
                </button>
              </div>
            </form>

            <button
              onClick={() => setShowAnagraficaModal(false)}
              style={{ marginTop: 20 }}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {showComandaModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowComandaModal(false)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowComandaModal(false);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                  <td>€ 0.00</td>
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
