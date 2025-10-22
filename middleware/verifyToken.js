import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) 
    return res.status(401).send('Nicht eingeloggt');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).send('Ungültiger Token');
  }
}