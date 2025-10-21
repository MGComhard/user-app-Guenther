import express from 'express';
import engine from 'ejs-mate';
import pool from './db.js';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import authRoutes from './routes/auth.js';
import pageRoutes from './routes/pages.js';
import productsRoutes from './routes/products.js';

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
app.use(authRoutes);
app.use(pageRoutes);
app.use(productsRoutes);

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
