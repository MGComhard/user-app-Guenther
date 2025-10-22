import jwt from 'jsonwebtoken';

export function exposeLoginStatus(req, res, next) {
  const token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.locals.isLoggedIn = true;
  } catch {
    res.locals.isLoggedIn = false;
  }

  next();
}