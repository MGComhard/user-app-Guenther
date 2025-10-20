import express from 'express';
import engine from 'ejs-mate';
import pool from './db.js';
import 'dotenv/config';
const app = express();

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Startseite'
  });
});

app.get('/shop', (req, res) => {
  res.render('shop', {
    title: 'Produkte'
  });
});

app.get('/about', (req, res) => {
  res.render('about', { 
    title: 'Über uns' 
  });
});

// Post für Nachricht absenden
app.post('/contact', (req, res) => {
  console.log('Formulardaten:', req.body);
  res.send('Nachricht erfolgreich gesendet!');
});

app.get('/contact', (req, res) => {
  res.render('contact', { 
    title: 'Kontaktseite' 
  });
});

app.post('/produkt-hinzufuegen', async (req, res) => {
  const { name, beschreibung, preis, bild_url } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.query(
      'INSERT INTO produkte (name, beschreibung, preis, bild_url) VALUES (?, ?, ?, ?)',
      [name, beschreibung, preis, bild_url]
    );
    conn.release();
    res.send('Produkt erfolgreich gespeichert!');
  } catch (err) {
    console.error('Fehler beim Einfügen:', err);
    res.status(500).send('Fehler beim Speichern');
  }
});


const PORT = process.env.PORT;
const HOST = process.env.HOST;
app.listen(PORT, HOST, () => {
  console.log(`🟢 Server läuft auf http://${HOST}:${PORT}`);
});
