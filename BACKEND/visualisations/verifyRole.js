const verifyRole = (role) => {
    return (req, res, next) => {
      const userRole = req.user.role; 
      if (userRole === role || userRole === 'admin') { 
        next();
      } else {
        res.status(403).json({ message: 'Accès interdit : rôle non autorisé.' });
      }
    };
  };
  
  module.exports = verifyRole;
  