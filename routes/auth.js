import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login',
    error: null,
    isLoggedIn: !!req.cookies.token
  });
});

router.post('/login', async (req, res) => {
  const { email, passwort } = req.body;
  if (!email || !passwort) {
    return res.status(400).render('login', {
      title: 'Login',
      error: 'Bitte E-Mail und Passwort eingeben.',
    });
  }

  try {
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM kunden WHERE email = ?', [email]);
    conn.release();

    if (rows.length === 0) {
      return res.redirect('/?error=Nutzer nicht gefunden');
    }
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(passwort, user.passwort_hash);
      if (!isMatch) {
        return res.redirect('/?error=Falsches Passwort');
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/');

  } catch (err) {
    console.error('Fehler beim Login:', err);
    res.status(500).render('login', {
      title: 'Login',
      error: 'Interner Fehler beim Login. Bitte später erneut versuchen.',
    });
  }
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Registrieren', error: null });
});

router.post('/register', async (req, res) => {
  const { vorname, nachname, email, passwort } = req.body;
  if (!vorname || !nachname || !email || !passwort) {
    return res.status(400).render('register', {
      title: 'Registrieren',
      error: 'Bitte alle Felder ausfüllen.',
    });
  }

  try {
    const conn = await pool.getConnection();
    const existing = await conn.query('SELECT id FROM kunden WHERE email = ?', [email]);
    if (existing.length > 0) {
      conn.release();
      return res.status(409).render('register', {
        title: 'Registrieren',
        error: 'Diese E-Mail ist bereits registriert.',
      });
    }

    const hash = await bcrypt.hash(passwort, 10);
    await conn.query(
      'INSERT INTO kunden (vorname, nachname, email, passwort_hash) VALUES (?, ?, ?, ?)',
      [vorname, nachname, email, hash]
    );
    conn.release();

    res.redirect('/login');
  } catch (err) {
    console.error('Fehler bei der Registrierung:', err);
    res.status(500).render('register', {
      title: 'Registrieren',
      error: 'Interner Fehler bei der Registrierung. Bitte später erneut versuchen.',
    });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

export default router;
