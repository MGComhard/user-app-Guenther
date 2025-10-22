import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  const error = req.query.error || null;
  res.render('index', { title: 'Startseite', error });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'Über uns' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Kontaktseite' });
});

router.post('/contact', (req, res) => {
  console.log('Formulardaten:', req.body);
  res.send('Nachricht erfolgreich gesendet!');
});

router.get('/shop', (req, res) => {
  res.render('shop', { title: 'Produkte' });
});

export default router;
