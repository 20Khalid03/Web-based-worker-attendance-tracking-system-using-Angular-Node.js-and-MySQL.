const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./utilisateurs'); 
const Ouvrier = require('../ouvriers/ouvrier'); 
require('dotenv').config();
const authMiddleware = require('./authMiddleware'); 

const jwtSecretKey = process.env.JWT_SECRET_KEY; 

router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: 'Login et mot de passe requis' });
  }

  try {
    const user = await User.findOne({ 
      where: { login },
      include: [{ model: Ouvrier, as: 'ouvrier' }] 
    });

    if (!user) {
      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },  
      jwtSecretKey,
      { expiresIn: '1h' }  
    );

    if (user.must_change_password) {
      return res.status(200).json({
        message: 'Vous devez changer votre mot de passe',
        token,
        role: user.role,
        userId: user.id,
        ouvrierId: user.ouvrier ? user.ouvrier.id : null,  
        mustChangePassword: true
      });
    }

    res.json({ 
      message: 'Connexion réussie', 
      token, 
      role: user.role,  
      userId: user.id, 
      ouvrierId: user.ouvrier ? user.ouvrier.id : null  
    });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
});
router.post('/change-password', authMiddleware(), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id; 

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.must_change_password = false;
    await user.save();

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du changement de mot de passe', error: error.message });
  }
});


router.get('/getallusers', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error });
  }
});

router.get('/getuserbyid/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
  }
});

router.put('/updateuser/:id', async (req, res) => {
  const { id } = req.params;
  const { login, password, First_Name, Last_Name, E_mail, role } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    user.login = login || user.login;
    user.First_Name = First_Name || user.First_Name;
    user.Last_Name = Last_Name || user.Last_Name;
    user.E_mail = E_mail || user.E_mail;
    user.role = role || user.role;  

    await user.save();
    res.json({ message: 'Utilisateur mis à jour avec succès', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error });
  }
});


router.delete('/deleteuser/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await user.destroy();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error });
  }
});


router.post('/adduser', authMiddleware(['admin']), async (req, res) => {
  const { login, password, First_Name, Last_Name, E_mail, role = 'admin' } = req.body; 

  if (!login || !password || !First_Name || !Last_Name || !E_mail) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const existingUser = await User.findOne({ where: { login } });
    if (existingUser) {
      return res.status(400).json({ message: 'L\'utilisateur existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      login,
      password: hashedPassword,
      First_Name,
      Last_Name,
      E_mail,
      role
    });

    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error: error.message });
  }
});
router.get('/settings/:user_id', authMiddleware(['ouvrier', 'admin']), async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id, 10);

    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id','login','password', 'First_Name', 'Last_Name', 'E_mail']
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération des paramètres de l\'utilisateur :', err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});
router.put('/settings/:user_id', authMiddleware(['ouvrier', 'admin']), async (req, res) => {
  try {
    const userId = parseInt(req.params.user_id, 10);
    const { First_Name, Last_Name, telephone, E_mail, login, newPassword } = req.body;

    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.First_Name = First_Name || user.First_Name;
    user.Last_Name = Last_Name || user.Last_Name;
    user.E_mail = E_mail || user.E_mail;
    user.login = login || user.login;

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({ 
      message: "Informations mises à jour avec succès",
      user: {
        id: user.id,
        login: user.login,
        First_Name: user.First_Name,
        Last_Name: user.Last_Name,
        E_mail: user.E_mail,
        telephone: user.telephone
      }
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour des paramètres de l\'utilisateur :', err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});
module.exports = router;
