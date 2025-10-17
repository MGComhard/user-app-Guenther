
import express from 'express';
import 'dotenv/config';
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');


app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { title: 'Startseite' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'Über uns' });
});

app.get('/about-pug', (req, res) => {
  res.render('about-pug.pug', { title: 'Über Uns (Pug)' });
});

// Post für Nachricht absenden (egal, ob ejs oder pug)
app.post('/contact', (req, res) => {
  console.log('Formulardaten:', req.body);
  res.send('Nachricht erfolgreich gesendet!');
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Kontaktseite' });
});

app.get('/contact-pug', (req, res) => {
  res.render('contact-pug.pug', { title: 'Kontaktseite (Pug)' });
});

const PORT = process.env.PORT;
const HOST = process.env.HOST;
app.listen(PORT, HOST, () => {
  console.log(`🟢 Server läuft auf http://${HOST}:${PORT}`);
});
