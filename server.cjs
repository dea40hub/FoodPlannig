// server.cjs - Backend per l'applicazione di gestione comande del ristorante
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require('node-thermal-printer'); // Importa la libreria

// Inizializzazione dell'app Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Percorsi dei file JSON per la persistenza dei dati
const DATA_DIR = path.join(__dirname, 'data');
const CAMERIERI_FILE = path.join(DATA_DIR, 'camerieri.json');
const TAVOLI_FILE = path.join(DATA_DIR, 'tavoli.json');
const CATEGORIE_FILE = path.join(DATA_DIR, 'categorie.json');
const PIATTI_FILE = path.join(DATA_DIR, 'piatti.json');
const COMANDE_FILE = path.join(DATA_DIR, 'comande.json');
const DETTAGLI_FILE = path.join(DATA_DIR, 'dettagli.json');

// Assicurati che la directory dei dati esista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Funzioni di utilità per la gestione dei file JSON
function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Errore nella lettura del file ${filePath}:`, err);
    return []; // Restituisce un array vuoto in caso di errore
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Errore nella scrittura del file ${filePath}:`, err);
  }
}

function getNextId(collection) {
  if (!Array.isArray(collection) || collection.length === 0) {
    return 1;
  }
  // Assicurati che tutti gli id siano numeri
  const ids = collection.map(item => parseInt(item.id)).filter(id => !isNaN(id));
  if (ids.length === 0) {
      return 1;
  }
  return Math.max(...ids) + 1;
}

// Inizializza i dati se non esistono
function initializeData() {
  // Inizializza camerieri (aggiunge ruolo)
  if (!fs.existsSync(CAMERIERI_FILE)) {
    // Aggiungi utente cassa di default
    writeJsonFile(CAMERIERI_FILE, [{ id: 1, nome: 'cassa', ruolo: 'cassa' }]);
  }

  // Inizializza tavoli
  if (!fs.existsSync(TAVOLI_FILE)) {
    const tavoli = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      numero: i + 1,
      stato: 'libero'
    }));
    writeJsonFile(TAVOLI_FILE, tavoli);
  }

  // Inizializza categorie
  if (!fs.existsSync(CATEGORIE_FILE)) {
    const categorie = [
      { id: 1, nome: 'Antipasti' },
      { id: 2, nome: 'Primi' },
      { id: 3, nome: 'Secondi' },
      { id: 4, nome: 'Pizze' },
      { id: 5, nome: 'Dolci' },
      { id: 6, nome: 'Bevande' }
    ];
    writeJsonFile(CATEGORIE_FILE, categorie);
  }

  // Inizializza piatti (aggiunge prezzo)
  if (!fs.existsSync(PIATTI_FILE)) {
    const piatti = [
      { id: 1, nome: 'Bruschette', categoria_id: 1, prezzo: 5.00 },
      { id: 2, nome: 'Prosciutto e Melone', categoria_id: 1, prezzo: 8.00 },
      { id: 3, nome: 'Caprese', categoria_id: 1, prezzo: 7.00 },
      { id: 4, nome: 'Spaghetti al Pomodoro', categoria_id: 2, prezzo: 8.00 },
      { id: 5, nome: 'Lasagne alla Bolognese', categoria_id: 2, prezzo: 10.00 },
      { id: 6, nome: 'Risotto ai Funghi', categoria_id: 2, prezzo: 11.00 },
      { id: 7, nome: 'Bistecca ai Ferri', categoria_id: 3, prezzo: 15.00 },
      { id: 8, nome: 'Pollo alla Griglia', categoria_id: 3, prezzo: 12.00 },
      { id: 9, nome: 'Salmone al Forno', categoria_id: 3, prezzo: 14.00 },
      { id: 10, nome: 'Margherita', categoria_id: 4, prezzo: 6.00 },
      { id: 11, nome: 'Diavola', categoria_id: 4, prezzo: 7.00 },
      { id: 12, nome: 'Quattro Stagioni', categoria_id: 4, prezzo: 8.00 },
      { id: 13, nome: 'Tiramisù', categoria_id: 5, prezzo: 5.00 },
      { id: 14, nome: 'Panna Cotta', categoria_id: 5, prezzo: 5.00 },
      { id: 15, nome: 'Acqua Naturale', categoria_id: 6, prezzo: 2.00 },
      { id: 16, nome: 'Coca Cola', categoria_id: 6, prezzo: 3.00 },
      { id: 17, nome: 'Vino Rosso della Casa', categoria_id: 6, prezzo: 8.00 }
    ];
    writeJsonFile(PIATTI_FILE, piatti);
  }

  // Inizializza comande
  if (!fs.existsSync(COMANDE_FILE)) {
    writeJsonFile(COMANDE_FILE, []);
  }

  // Inizializza dettagli comande
  if (!fs.existsSync(DETTAGLI_FILE)) {
    writeJsonFile(DETTAGLI_FILE, []);
  }
}

// Inizializza i dati
initializeData();

// Middleware per l'autenticazione e autorizzazione (semplificato)
function checkRole(requiredRole) {
  return (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole) {
      return res.status(401).json({ error: 'Autenticazione richiesta' });
    }

    if (requiredRole && userRole !== requiredRole) {
      return res.status(403).json({ error: 'Permesso negato' });
    }

    req.user = { id: parseInt(userId), ruolo: userRole };
    next();
  };
}

// API Routes

// API per il login (modificata per restituire il ruolo)
app.post('/api/login', (req, res) => {
  const { nome } = req.body;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'Il nome utente è obbligatorio' });
  }

  try {
    const camerieri = readJsonFile(CAMERIERI_FILE);
    let utente = camerieri.find(c => c.nome.toLowerCase() === nome.trim().toLowerCase());

    if (utente) {
      return res.json(utente);
    } else {
      if (nome.trim().toLowerCase() !== 'cassa') {
        const newCameriere = {
          id: getNextId(camerieri),
          nome: nome.trim(),
          ruolo: 'cameriere'
        };
        camerieri.push(newCameriere);
        writeJsonFile(CAMERIERI_FILE, camerieri);
        return res.json(newCameriere);
      } else {
        return res.status(401).json({ error: 'Credenziali non valide' });
      }
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// API per i tavoli
app.get('/api/tavoli', (req, res) => {
  try {
    const tavoli = readJsonFile(TAVOLI_FILE);
    res.json(tavoli);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Aggiorna lo stato di un tavolo
app.patch('/api/tavoli/:id', (req, res) => {
  const { id } = req.params;
  const { stato } = req.body;

  if (!stato || !['libero', 'occupato'].includes(stato)) {
    return res.status(400).json({ error: 'Stato non valido. Deve essere "libero" o "occupato"' });
  }

  try {
    const tavoli = readJsonFile(TAVOLI_FILE);
    const tavoloIndex = tavoli.findIndex(t => t.id === parseInt(id));

    if (tavoloIndex === -1) {
      return res.status(404).json({ error: 'Tavolo non trovato' });
    }

    tavoli[tavoloIndex].stato = stato;
    writeJsonFile(TAVOLI_FILE, tavoli);

    res.json({ id: parseInt(id), stato });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// API per le categorie
app.get('/api/categorie', (req, res) => {
  try {
    const categorie = readJsonFile(CATEGORIE_FILE);
    res.json(categorie);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// API per i piatti
app.get('/api/piatti', (req, res) => {
  const { categoria_id } = req.query;

  try {
    const piatti = readJsonFile(PIATTI_FILE);
    const categorie = readJsonFile(CATEGORIE_FILE);

    const piattiConCategoria = piatti.map(piatto => {
      const categoria = categorie.find(c => c.id === piatto.categoria_id);
      return {
        ...piatto,
        prezzo: piatto.prezzo || 0,
        categoria_nome: categoria ? categoria.nome : 'Sconosciuta'
      };
    });

    if (categoria_id) {
      const filteredPiatti = piattiConCategoria.filter(p => p.categoria_id === parseInt(categoria_id));
      return res.json(filteredPiatti);
    }

    res.json(piattiConCategoria);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// API per le comande (POST)
app.post('/api/comande', checkRole(), (req, res) => {
  const { tavoloId, coperti, piatti } = req.body;
  const cameriereId = req.user.id;

  if (!tavoloId || !cameriereId || !coperti || !piatti || !Array.isArray(piatti) || piatti.length === 0) {
    return res.status(400).json({ error: 'Dati mancanti o non validi' });
  }

  try {
    const comande = readJsonFile(COMANDE_FILE);
    const dettagli = readJsonFile(DETTAGLI_FILE);
    const tavoli = readJsonFile(TAVOLI_FILE);

    const newComanda = {
      id: getNextId(comande),
      tavolo_id: parseInt(tavoloId),
      cameriere_id: parseInt(cameriereId),
      coperti: parseInt(coperti),
      stato: 'aperta',
      timestamp: new Date().toISOString(),
      sconto: 0
    };

    const tavoloIndex = tavoli.findIndex(t => t.id === parseInt(tavoloId));
    if (tavoloIndex !== -1) {
      tavoli[tavoloIndex].stato = 'occupato';
      writeJsonFile(TAVOLI_FILE, tavoli);
    }

    comande.push(newComanda);
    writeJsonFile(COMANDE_FILE, comande);

    const newDettagli = piatti.map(piatto => ({
      id: getNextId(dettagli),
      comanda_id: newComanda.id,
      piatto_id: parseInt(piatto.piattoId),
      quantita: parseInt(piatto.quantita),
      turno: piatto.turno,
      stato: 'da_preparare',
      note: piatto.note || ''
    }));

    dettagli.push(...newDettagli);
    writeJsonFile(DETTAGLI_FILE, dettagli);

    // --- Stampa Comanda (opzionale, dopo creazione) ---
    // Potresti chiamare la funzione di stampa qui se necessario
    // printComanda(newComanda.id);
    // --- Fine Stampa Comanda ---

    res.json({
      ...newComanda,
      piatti: newDettagli
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Ottieni comande per stato
app.get('/api/comande', (req, res) => {
  const { stato } = req.query;

  try {
    const comande = readJsonFile(COMANDE_FILE);
    const tavoli = readJsonFile(TAVOLI_FILE);

    const comandeConTavolo = comande.map(comanda => {
      const tavolo = tavoli.find(t => t.id === comanda.tavolo_id);
      return {
        ...comanda,
        tavolo_numero: tavolo ? tavolo.numero : 'Sconosciuto'
      };
    });

    if (stato) {
      const stati = stato.split(',');
      const filteredComande = comandeConTavolo.filter(c => stati.includes(c.stato));
      return res.json(filteredComande);
    }

    res.json(comandeConTavolo);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// API per i dettagli delle comande (GET)
app.get('/api/dettagli', (req, res) => {
  const { comandaId } = req.query;

  if (!comandaId) {
    return res.status(400).json({ error: 'ID comanda mancante' });
  }

  try {
    const dettagli = readJsonFile(DETTAGLI_FILE);
    const piatti = readJsonFile(PIATTI_FILE);

    const dettagliComanda = dettagli.filter(d => d.comanda_id === parseInt(comandaId));

    const dettagliConPiatto = dettagliComanda.map(dettaglio => {
      const piatto = piatti.find(p => p.id === dettaglio.piatto_id);
      return {
        ...dettaglio,
        piatto_nome: piatto ? piatto.nome : 'Sconosciuto',
        prezzo_unitario: piatto ? piatto.prezzo : 0
      };
    });

    dettagliConPiatto.sort((a, b) => {
      if (a.turno !== b.turno) {
        return a.turno.localeCompare(b.turno);
      }
      return a.piatto_nome.localeCompare(b.piatto_nome);
    });

    res.json(dettagliConPiatto);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Aggiorna lo stato di un dettaglio comanda (PATCH)
app.patch('/api/dettagli/:id', checkRole(), (req, res) => {
  const { id } = req.params;
  const { stato } = req.body;

  if (!stato || !['da_preparare', 'in_preparazione', 'pronto', 'servito'].includes(stato)) {
    return res.status(400).json({ error: 'Stato non valido' });
  }

  try {
    const dettagli = readJsonFile(DETTAGLI_FILE);
    const dettaglioIndex = dettagli.findIndex(d => d.id === parseInt(id));

    if (dettaglioIndex === -1) {
      return res.status(404).json({ error: 'Dettaglio non trovato' });
    }

    dettagli[dettaglioIndex].stato = stato;
    writeJsonFile(DETTAGLI_FILE, dettagli);

    const comandaId = dettagli[dettaglioIndex].comanda_id;
    updateComandaStato(comandaId);

    res.json({ id: parseInt(id), stato });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// --- NUOVE API PER LA CASSA --- //

// Elimina un dettaglio comanda (solo cassa)
app.delete('/api/dettagli/:id', checkRole('cassa'), (req, res) => {
  const { id } = req.params;

  try {
    let dettagli = readJsonFile(DETTAGLI_FILE);
    const dettaglioIndex = dettagli.findIndex(d => d.id === parseInt(id));

    if (dettaglioIndex === -1) {
      return res.status(404).json({ error: 'Dettaglio non trovato' });
    }

    const comandaId = dettagli[dettaglioIndex].comanda_id;
    dettagli.splice(dettaglioIndex, 1);
    writeJsonFile(DETTAGLI_FILE, dettagli);

    updateComandaStato(comandaId);

    res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Chiudi una comanda (solo cassa)
app.patch('/api/comande/:id/chiudi', checkRole('cassa'), (req, res) => {
  const { id } = req.params;

  try {
    const comande = readJsonFile(COMANDE_FILE);
    const comandaIndex = comande.findIndex(c => c.id === parseInt(id));

    if (comandaIndex === -1) {
      return res.status(404).json({ error: 'Comanda non trovata' });
    }

    comande[comandaIndex].stato = 'chiusa';
    writeJsonFile(COMANDE_FILE, comande);

    const tavoloId = comande[comandaIndex].tavolo_id;
    const tavoli = readJsonFile(TAVOLI_FILE);
    const tavoloIndex = tavoli.findIndex(t => t.id === tavoloId);
    if (tavoloIndex !== -1) {
      tavoli[tavoloIndex].stato = 'libero';
      writeJsonFile(TAVOLI_FILE, tavoli);
    }

    res.json(comande[comandaIndex]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Applica sconto a una comanda (solo cassa)
app.patch('/api/comande/:id/sconto', checkRole('cassa'), (req, res) => {
  const { id } = req.params;
  const { scontoPercentuale } = req.body;

  if (scontoPercentuale === undefined || typeof scontoPercentuale !== 'number' || scontoPercentuale < 0 || scontoPercentuale > 100) {
    return res.status(400).json({ error: 'Percentuale di sconto non valida' });
  }

  try {
    const comande = readJsonFile(COMANDE_FILE);
    const comandaIndex = comande.findIndex(c => c.id === parseInt(id));

    if (comandaIndex === -1) {
      return res.status(404).json({ error: 'Comanda non trovata' });
    }

    comande[comandaIndex].sconto = parseFloat(scontoPercentuale);
    writeJsonFile(COMANDE_FILE, comande);

    res.json(comande[comandaIndex]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Sposta tavolo (solo cassa)
app.patch('/api/tavoli/:id/sposta', checkRole('cassa'), (req, res) => {
    const { id } = req.params;
    const { nuovoTavoloId } = req.body;

    if (!nuovoTavoloId) {
        return res.status(400).json({ error: 'ID nuovo tavolo mancante' });
    }

    try {
        const tavoli = readJsonFile(TAVOLI_FILE);
        const comande = readJsonFile(COMANDE_FILE);

        const vecchioTavoloIndex = tavoli.findIndex(t => t.id === parseInt(id));
        const nuovoTavoloIndex = tavoli.findIndex(t => t.id === parseInt(nuovoTavoloId));

        if (vecchioTavoloIndex === -1 || nuovoTavoloIndex === -1) {
            return res.status(404).json({ error: 'Uno o entrambi i tavoli non trovati' });
        }

        if (tavoli[nuovoTavoloIndex].stato === 'occupato') {
            return res.status(400).json({ error: 'Il tavolo di destinazione è già occupato' });
        }

        const comandaAttivaIndex = comande.findIndex(c => c.tavolo_id === parseInt(id) && c.stato !== 'chiusa');

        if (comandaAttivaIndex === -1) {
            return res.status(400).json({ error: 'Nessuna comanda attiva trovata per il tavolo di origine' });
        }

        comande[comandaAttivaIndex].tavolo_id = parseInt(nuovoTavoloId);
        writeJsonFile(COMANDE_FILE, comande);

        tavoli[vecchioTavoloIndex].stato = 'libero';
        tavoli[nuovoTavoloIndex].stato = 'occupato';
        writeJsonFile(TAVOLI_FILE, tavoli);

        res.json({ message: `Tavolo ${id} spostato su tavolo ${nuovoTavoloId}` });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// --- API PER LA STAMPA TERMICA --- //

// Configurazione della stampante (esempio con stampante di rete)
// Modifica questi valori in base alla tua stampante
const printerConfig = {
  type: PrinterTypes.NETWORK, // O PrinterTypes.USB
  host: '192.168.1.100',     // Indirizzo IP della stampante di rete
  port: 9100,                // Porta standard per stampanti di rete
  // Per USB:
  // interface: 'USB001', // O il percorso del dispositivo corretto (es. /dev/usb/lp0)
  characterSet: CharacterSet.PC850_MULTILINGUAL, // Imposta il set di caratteri
  removeSpecialCharacters: false,
  breakLine: BreakLine.WORD,
  options: {                   // Opzioni aggiuntive
    timeout: 5000              // Timeout in ms
  }
};

// Funzione asincrona per stampare una comanda
async function printComanda(comandaId) {
  try {
    // Recupera i dati della comanda
    const comande = readJsonFile(COMANDE_FILE);
    const dettagli = readJsonFile(DETTAGLI_FILE);
    const piatti = readJsonFile(PIATTI_FILE);
    const tavoli = readJsonFile(TAVOLI_FILE);
    const camerieri = readJsonFile(CAMERIERI_FILE);

    const comanda = comande.find(c => c.id === parseInt(comandaId));
    if (!comanda) {
      throw new Error('Comanda non trovata per la stampa');
    }

    const dettagliComanda = dettagli.filter(d => d.comanda_id === comanda.id);
    const tavolo = tavoli.find(t => t.id === comanda.tavolo_id);
    const cameriere = camerieri.find(c => c.id === comanda.cameriere_id);

    // Inizializza la stampante
    let printer = new ThermalPrinter(printerConfig);

    // Formatta la stampa
    printer.alignCenter();
    printer.println(`COMANDA TAVOLO ${tavolo ? tavolo.numero : 'N/A'}`);
    printer.println(`Cameriere: ${cameriere ? cameriere.nome : 'N/A'}`);
    printer.println(`Coperti: ${comanda.coperti}`);
    printer.println(`Data: ${new Date(comanda.timestamp).toLocaleString('it-IT')}`);
    printer.drawLine();
    printer.alignLeft();

    // Stampa i dettagli raggruppati per turno
    const turni = [...new Set(dettagliComanda.map(d => d.turno))].sort();
    for (const turno of turni) {
        printer.bold(true);
        printer.println(`--- ${turno} ---`);
        printer.bold(false);
        const dettagliTurno = dettagliComanda.filter(d => d.turno === turno);
        dettagliTurno.forEach(dettaglio => {
            const piatto = piatti.find(p => p.id === dettaglio.piatto_id);
            printer.println(`${dettaglio.quantita} x ${piatto ? piatto.nome : 'Piatto Sconosciuto'}`);
            if (dettaglio.note) {
                printer.println(`  * ${dettaglio.note}`);
            }
        });
    }

    printer.drawLine();
    printer.cut(); // Taglia la carta

    // Esegui la stampa
    await printer.execute();
    console.log(`Comanda ${comandaId} inviata alla stampante.`);
    return true;

  } catch (error) {
    console.error(`Errore durante la stampa della comanda ${comandaId}:`, error);
    return false;
  }
}

// API per richiedere la stampa di una comanda
app.post('/api/comande/:id/stampa', checkRole(), async (req, res) => {
  const { id } = req.params;
  try {
    const success = await printComanda(parseInt(id));
    if (success) {
      res.json({ message: 'Comanda inviata alla stampante' });
    } else {
      res.status(500).json({ error: 'Errore durante la stampa della comanda' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- FINE API STAMPA TERMICA --- //

// Funzione helper per aggiornare lo stato della comanda
function updateComandaStato(comandaId) {
  try {
    const comande = readJsonFile(COMANDE_FILE);
    const dettagli = readJsonFile(DETTAGLI_FILE);
    const comandaIndex = comande.findIndex(c => c.id === comandaId);

    if (comandaIndex !== -1 && comande[comandaIndex].stato !== 'chiusa') {
      const dettagliComanda = dettagli.filter(d => d.comanda_id === comandaId);
      const hasPronti = dettagliComanda.some(d => d.stato === 'pronto');
      const hasInPreparazione = dettagliComanda.some(d => d.stato === 'in_preparazione');
      const allServiti = dettagliComanda.every(d => d.stato === 'servito');

      let nuovoStato = 'aperta';
      if (allServiti && dettagliComanda.length > 0) {
        nuovoStato = comande[comandaIndex].stato;
      } else if (hasPronti) {
        nuovoStato = 'pronta';
      } else if (hasInPreparazione) {
        nuovoStato = 'in_preparazione';
      }

      if (comande[comandaIndex].stato !== nuovoStato) {
        comande[comandaIndex].stato = nuovoStato;
        writeJsonFile(COMANDE_FILE, comande);
      }
    }
  } catch (err) {
    console.error(`Errore nell'aggiornamento dello stato della comanda ${comandaId}:`, err);
  }
}

// Serve l'app React in produzione
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});

