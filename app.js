import express from 'express';
import engine from 'ejs-mate';
import pool from './db.js';
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

const app = express();

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.cookies.token;
  next();
});

// Middleware
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Nicht eingeloggt');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).send('Ungültiger Token');
  }
}

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Startseite'
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

app.post('/produkt-hinzufuegen', authMiddleware, async (req, res) => {
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

app.get('/register', (req, res) => {
  res.render('register', { title: 'Registrieren' });
});

app.post('/register', async (req, res) => {
  const { vorname, nachname, email, passwort } = req.body;
  const hash = await bcrypt.hash(passwort, 10);

try {
  const conn = await pool.getConnection();
  await conn.query(
    'INSERT INTO kunden (vorname, nachname, email, passwort_hash) VALUES (?, ?, ?, ?)',
    [vorname, nachname, email, hash]
  );
  conn.release();
  res.send('Registrierung erfolgreich!');
} catch (err) {
  console.error(err);
  res.status(500).send('Fehler bei der Registrierung');
}
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
  const { email, passwort } = req.body;

  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      'SELECT * FROM kunden WHERE email = ?',
      [email]
    );
    conn.release();

    if (rows.length === 0) return res.status(401).send('Nutzer nicht gefunden');

    const user = rows[0];
    const isMatch = await bcrypt.compare(passwort, user.passwort_hash);
    if (!isMatch) return res.status(401).send('Falsches Passwort');

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Login-Fehler');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

app.get('/shop', (req, res) => {
  res.render('shop', { title: 'Produkte' });
});

pool.getConnection()
  .then(conn => {
    console.log('✅ Verbindung zur Datenbank erfolgreich');
    conn.release();

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.SERVER_HOST || 'localhost';

    app.listen(PORT, HOST, () => {
      console.log(`🟢 Server läuft auf http://${HOST}:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Datenbankverbindung fehlgeschlagen:', err);
    process.exit(1);
  });
