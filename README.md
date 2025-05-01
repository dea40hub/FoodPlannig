# Applicazione Gestione Comande Ristorante

Questa è un'applicazione web per la gestione delle comande di un ristorante, sviluppata utilizzando React per il frontend ed Express.js per il backend, con persistenza dei dati basata su file JSON.

## Struttura del Progetto

```
ristorante-react-app-v2/
├── dist/                   # Build di produzione del frontend React (generato)
├── data/                    # Directory per i file JSON di persistenza
│   ├── camerieri.json
│   ├── categorie.json
│   ├── comande.json
│   ├── dettagli.json
│   ├── piatti.json
│   └── tavoli.json
├── node_modules/            # Dipendenze del progetto
├── public/                  # File statici per il frontend React
├── src/                     # Codice sorgente del frontend React
│   ├── components/          # Componenti React riutilizzabili
│   │   ├── ComandaModal.js
│   │   ├── Header.js
│   │   ├── LoginForm.js
│   │   ├── OrdiniList.js
│   │   ├── PiattiSelector.js
│   │   └── TavoliGrid.js
│   ├── pages/               # Pagine dell'applicazione React
│   │   ├── CassaPage.js       # Nuova pagina per la cassa
│   │   ├── CassaPage.css      # Stili per la pagina cassa
│   │   ├── CucinaPage.js
│   │   └── SalaPage.js
│   ├── App.css              # Stili globali
│   ├── App.js               # Componente principale e routing
│   ├── index.css            # Stili di base
│   ├── index.js             # Punto di ingresso del frontend
│   └── setupProxy.js        # Configurazione proxy per API backend
├── .gitignore               # File ignorati da Git
├── package.json             # Metadati e dipendenze del progetto
├── pnpm-lock.yaml           # File di lock delle dipendenze pnpm
├── README.md                # Questo file
└── server.cjs               # Server backend Express.js
```

## Funzionalità

*   **Login Utente**: Gli utenti (camerieri o cassa) possono effettuare il login inserendo il proprio nome. Se il nome non esiste (e non è "cassa"), viene creato un nuovo cameriere. L'utente "cassa" deve essere pre-esistente.
*   **Ruoli Utente**:
    *   **Cameriere**: Può visualizzare la sala, prendere comande, aggiornare lo stato dei piatti (servito).
    *   **Cassa**: Ha tutti i permessi del cameriere, più:
        *   Accesso alla **Pagina Cassa** dedicata.
        *   Applicare **sconti** alle comande.
        *   **Chiudere** le comande (e liberare il tavolo).
        *   **Spostare** i tavoli occupati.
        *   **Eliminare** singoli articoli da una comanda.
        *   Richiedere la **stampa** della comanda.
*   **Visualizzazione Sala**: Mostra la griglia dei tavoli con il loro stato (libero/occupato).
*   **Gestione Comande (Cameriere/Cassa)**: Cliccando su un tavolo, si apre un modal per creare o modificare una comanda.
    *   Selezione piatti per categoria.
    *   Indicazione del numero di coperti.
    *   Selezione del turno (T1, T2, ecc.).
    *   Aggiunta di note ai piatti.
    *   Salvataggio della comanda.
*   **Pagina Cassa**: Interfaccia dedicata simile a un POS per la gestione avanzata delle comande, inclusi calcolo del totale, applicazione sconti, chiusura e stampa.
*   **Visualizzazione Cucina**: Mostra l'elenco degli ordini (dettagli delle comande) raggruppati per comanda, con la possibilità per la cucina di aggiornare lo stato dei singoli piatti (da preparare -> in preparazione -> pronto).
*   **Stampa Termica**: Possibilità di inviare la comanda a una stampante termica (ESC/POS) collegata via rete o USB. La configurazione della stampante si trova in `server.cjs`.
*   **Persistenza Dati**: I dati relativi a utenti, tavoli, categorie, piatti, comande e dettagli vengono salvati in file JSON nella directory `data/`.

## Installazione

1.  **Clonare il repository** (o estrarre i file forniti).
2.  **Installare le dipendenze**: Assicurarsi di avere Node.js e pnpm installati. Eseguire il seguente comando nella directory principale del progetto (`ristorante-react-app-v2`):
    ```bash
    pnpm install
    ```

## Utilizzo (Modalità Sviluppo)

Per avviare l'applicazione in modalità sviluppo, è necessario avviare separatamente il server backend e il client frontend.

1.  **Configurare la Stampante (Opzionale)**: Modificare la sezione `printerConfig` nel file `server.cjs` con i dettagli della propria stampante termica (tipo di connessione, IP/porta o interfaccia USB).
2.  **Avviare il Server Backend**:
    Aprire un terminale nella directory principale del progetto ed eseguire:
    ```bash
    node server.cjs
    ```
    Il server si avvierà sulla porta 5000 (o un'altra porta se specificata dalla variabile d'ambiente PORT).

3.  **Avviare il Client Frontend**:
    Aprire un *secondo* terminale nella directory principale del progetto ed eseguire:
    ```bash
    pnpm start
    ```
    Questo avvierà il server di sviluppo React (solitamente sulla porta 3000 o successiva) e aprirà l'applicazione nel browser.

4.  **Login**: Effettuare il login come "cassa" per accedere alle funzionalità avanzate o con un altro nome per operare come cameriere.

## Build per la Produzione

Per creare una build ottimizzata per la produzione:

1.  **Configurare la Stampante (Opzionale)**: Assicurarsi che la configurazione della stampante in `server.cjs` sia corretta per l'ambiente di produzione.
2.  **Eseguire il build del frontend React**:
    ```bash
    pnpm build
    ```
    Questo comando creerà la directory `dist/` con i file statici ottimizzati del frontend.

3.  **Avviare il server Express in produzione**:
    Il server Express (`server.cjs`) è già configurato per servire i file statici dalla directory `dist/`. È sufficiente avviare il server:
    ```bash
    node server.cjs
    ```
    L'applicazione sarà accessibile all'indirizzo `http://localhost:5000` (o la porta configurata).

## Note Tecniche

*   **Persistenza**: A causa di problemi tecnici riscontrati con i moduli SQLite nell'ambiente di sviluppo iniziale, la persistenza dei dati è stata implementata utilizzando file JSON. In un ambiente di produzione reale, si consiglia di sostituire questa implementazione con un database più robusto (es. SQLite, PostgreSQL, MongoDB).
*   **Errore `path-to-regexp`**: Durante lo sviluppo in alcuni ambienti, è stato riscontrato un errore con il modulo `path-to-regexp` che impediva l'avvio del server Express. Se si verifica questo errore, potrebbe essere necessario investigare ulteriormente le compatibilità delle versioni dei pacchetti o provare ad eseguire l'applicazione in un ambiente diverso.
*   **Stampa Termica**: L'integrazione con la stampante termica utilizza la libreria `node-thermal-printer`. Potrebbe essere necessario installare driver specifici per la stampante sul sistema operativo su cui gira il server backend, specialmente per le connessioni USB.
*   **Gestione Errori**: L'applicazione include una gestione di base degli errori, ma potrebbe essere ulteriormente migliorata.
*   **Autenticazione**: Il login attuale è semplice e basato solo sul nome. Per un'applicazione reale, sarebbe necessaria un'autenticazione più sicura (es. password, JWT).

