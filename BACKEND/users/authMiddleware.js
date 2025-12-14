const jwt = require('jsonwebtoken');
const User = require('../users/utilisateurs'); 
require('dotenv').config();

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecretKey);
      
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      req.user = {
        id: user.id,
        role: user.role,
        ouvrierId: user.ouvrierId
      };

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Accès interdit' });
      }

      next();
    } catch (error) {
      console.error('Erreur lors de la vérification du token :', error);
      res.status(401).json({ message: 'Token invalide', error: error.message });
    }
  };
};

module.exports = authMiddleware;