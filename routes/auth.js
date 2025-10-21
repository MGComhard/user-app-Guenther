import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  const { email, passwort } = req.body;
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM kunden WHERE email = ?', [email]);

    conn.release();

    if (rows.length === 0) 
      return res.status(401).send('Nutzer nicht gefunden');

    const user = rows[0];
    const isMatch = await bcrypt.compare(passwort, user.passwort_hash);
    if (!isMatch) 
      return res.status(401).send('Falsches Passwort');

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Login-Fehler');
  }
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Registrieren' });
});

router.post('/register', async (req, res) => {
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

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

export default router;
