import React, { useState, useEffect } from 'react';
import './CassaPage.css'; // Creeremo questo file CSS

function CassaPage() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [currentOrder, setCurrentOrder] = useState([]);
    const [orderTotal, setOrderTotal] = useState(0);
    const [selectedTable, setSelectedTable] = useState(null); // Aggiungere logica per selezionare tavolo

    // Simula il caricamento ordinazioni
    useEffect(() => {
        if (!localStorage.getItem('categorie')) {
          localStorage.setItem('categorie', JSON.stringify([
            { id: 1, nome: 'Pizza' },
            { id: 2, nome: 'Bevande' }
          ]));
        }
      
        if (!localStorage.getItem('piatti')) {
          localStorage.setItem('piatti', JSON.stringify([
            { id: 101, nome: 'Margherita', categoria_id: 1, prezzo: 6.5 },
            { id: 102, nome: 'Coca Cola', categoria_id: 2, prezzo: 2.0 }
          ]));
        }
      }, []);

    // Simula il caricamento di categorie e prodotti
    useEffect(() => {
        // In un'applicazione reale, questi dati verrebbero caricati dal backend
        const loadedCategories = JSON.parse(localStorage.getItem('categorie')) || [];
        const loadedProducts = JSON.parse(localStorage.getItem('piatti')) || [];
        setCategories(loadedCategories);
        setProducts(loadedProducts);
        if (loadedCategories.length > 0) {
            setSelectedCategory(loadedCategories[0].id);
        }
    }, []);

    // Calcola il totale dell'ordine ogni volta che cambia
    useEffect(() => {
        const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setOrderTotal(total);
    }, [currentOrder]);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const handleProductClick = (product) => {
        // Aggiungi prodotto all'ordine corrente
        setCurrentOrder(prevOrder => {
            const existingItemIndex = prevOrder.findIndex(item => item.id === product.id);
            if (existingItemIndex > -1) {
                // Aggiorna quantità se il prodotto esiste già
                const updatedOrder = [...prevOrder];
                updatedOrder[existingItemIndex].quantity += 1;
                return updatedOrder;
            } else {
                // Aggiungi nuovo prodotto
                // Assumiamo che il prezzo sia disponibile nel prodotto, altrimenti caricarlo
                const price = product.prezzo || 10.00; // Prezzo di default se non presente
                return [...prevOrder, { ...product, quantity: 1, price: price }];
            }
        });
    };

    const handleRemoveItem = (productId) => {
        setCurrentOrder(prevOrder => prevOrder.filter(item => item.id !== productId));
    };

    const handleQuantityChange = (productId, change) => {
        setCurrentOrder(prevOrder => {
            const updatedOrder = prevOrder.map(item => {
                if (item.id === productId) {
                    const newQuantity = item.quantity + change;
                    return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }; // Minimo 1
                }
                return item;
            });
            return updatedOrder.filter(item => item.quantity > 0); // Rimuovi se quantità è 0
        });
    };

    // Filtra i prodotti per la categoria selezionata
    const filteredProducts = products.filter(p => p.categoria_id === selectedCategory);

    return (
        <div className="cassa-page">
            <header className="cassa-header">
                {/* Intestazione simile all'immagine */} 
                <div className="header-left">FIRESHOP.NET</div>
                <div className="header-center">
                    {/* Pulsanti Tavoli / Asporto */} 
                    <button className="btn">Tavoli & Sale</button>
                    <button className="btn">Asporto & Consegne</button>
                </div>
                <div className="header-right">
                    <span>Operatore: Cassa</span> {/* Da rendere dinamico */} 
                    <span>{new Date().toLocaleDateString('it-IT')} {new Date().toLocaleTimeString('it-IT')}</span>
                </div>
            </header>

            <div className="cassa-body">
                <aside className="cassa-sidebar-left">
                    {/* Pulsanti Conto Disponibile */} 
                    <button className="btn btn-conto">Conto 1 Disponibile</button>
                    <button className="btn btn-conto">Conto 2 Disponibile</button>
                    {/* Navigazione Categorie */} 
                    <nav className="category-nav">
                        {categories.map(category => (
                            <button 
                                key={category.id} 
                                className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                {category.nome}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="cassa-main">
                    {/* Griglia Prodotti */} 
                    <div className="product-grid">
                        {filteredProducts.map(product => (
                            <button key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
                                {/* Immagine prodotto (se disponibile) */} 
                                <div className="product-name">{product.nome}</div>
                                <div className="product-price">€ {(product.prezzo || 10.00).toFixed(2)}</div>
                            </button>
                        ))}
                    </div>
                </main>

                <aside className="cassa-sidebar-right">
                    {/* Riepilogo Ordine */} 
                    <div className="order-summary">
                        <div className="order-total-display">€ {orderTotal.toFixed(2)}</div>
                        <div className="order-details">
                            <span>Pezzi: {currentOrder.reduce((sum, item) => sum + item.quantity, 0)}</span>
                            <span>Operatore: Cassa</span>
                        </div>
                        <ul className="order-items-list">
                            {currentOrder.map(item => (
                                <li key={item.id} className="order-item">
                                    <div className="item-info">
                                        <span>{item.quantity} x {item.nome}</span>
                                        <span>€ {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <div className="item-actions">
                                        <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                                        <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                                        <button onClick={() => handleRemoveItem(item.id)}>&times;</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Tastierino Numerico e Pulsanti Azione */} 
                    <div className="keypad-actions">
                        <div className="keypad">
                            {/* Pulsanti 7-8-9, 4-5-6, 1-2-3, 0, . */} 
                            {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.'].map(key => (
                                <button key={key} className="keypad-button">{key}</button>
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
        </div>
    );
}

export default CassaPage;

