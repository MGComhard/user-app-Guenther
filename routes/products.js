import express from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/produkt-hinzufuegen', authMiddleware, async (req, res) => {
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

export default router;