import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Startseite' });
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
