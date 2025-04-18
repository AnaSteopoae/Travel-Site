import jwt from 'jsonwebtoken';

export default function(req, res, next) {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: 'Nu există token. Autentificare necesară.' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = { id: decoded.id, role: decoded.role };
      
      next();
    } catch (err) {
      console.error('Eroare la verificarea token-ului:', err);
      return res.status(401).json({ message: 'Token invalid sau expirat' });
    }
}