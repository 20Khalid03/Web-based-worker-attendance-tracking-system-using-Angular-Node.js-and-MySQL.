const verifyAdminOrOuvrier = (req, res, next) => {
    const userRole = req.user.role; 
    if (userRole === 'admin' || userRole === 'ouvrier') {
      next();
    } else {
      res.status(403).json({ message: 'Accès interdit : rôle non autorisé.' });
    }
  };
  
  module.exports = verifyAdminOrOuvrier;
  