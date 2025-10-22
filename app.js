import express from 'express';
import engine from 'ejs-mate';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import pageRoutes from './routes/pages.js';
import productsRoutes from './routes/products.js';
import { exposeLoginStatus } from './middleware/loginStatus.js';
import { Database } from './utils/database.js';
import 'dotenv/config';


const app = express();

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(exposeLoginStatus);
app.use(authRoutes);
app.use(pageRoutes);
app.use(productsRoutes);
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.cookies.token;
  next();
});

Database()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.SERVER_HOST || 'localhost';
    app.listen(PORT, HOST, () => {
      console.log(`🟢 Server läuft auf http://${HOST}:${PORT}`);
    });
  })
  .catch(() => {
    process.exit(1);
  });
