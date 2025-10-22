import pool from '../db.js';

export async function Database() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Verbindung zur Datenbank erfolgreich');
    conn.release();
  } catch (err) {
    console.error('❌ Datenbankverbindung fehlgeschlagen:', err);
    throw err;
  }
}