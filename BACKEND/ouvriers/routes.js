const express = require('express');
const router = express.Router();
const Ouvrier = require('./ouvrier');
const Pointage = require('../pointage/pointage');
const upload = require('./multer');
const User = require('../users/utilisateurs');
const authMiddleware = require('../users/authMiddleware');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const {fn, col, literal } = require('sequelize'); 
const sequelize = require('../db');

const saltRounds = 10;

const timezone = 'Africa/Casablanca';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'khalidahrour123@gmail.com',
    pass: 'caga knsl tdfd opig'
  }
});

function generateSecurePassword(length = 12) {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

router.post('/uploadPhoto', authMiddleware(['admin']), (req, res) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.json({ file: req.file });
  });
});

router.post('/addOuvrier', authMiddleware(['admin']), upload.single('photo'), async (req, res) => {
  try {
    const { First_Name, Last_Name, CIN, telephone, E_mail, date_de_naissance } = req.body;

    const existingOuvrier = await Ouvrier.findOne({ where: { CIN } });

    if (existingOuvrier) {
      return res.status(400).send({ message: 'Cet ouvrier existe déjà avec ce CIN.' });
    }

    const newOuvrier = await Ouvrier.create({
      First_Name,
      Last_Name,
      CIN,
      telephone,
      E_mail,
      date_de_naissance,
      photo: req.file ? req.file.path : null
    });

    const securePassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(securePassword, 10);

    const login = `${First_Name.toLowerCase()}_${Last_Name.toLowerCase()}`;

    const existingUser = await User.findOne({ where: { login } });
    if (existingUser) {
      await Ouvrier.destroy({ where: { id: newOuvrier.id } });
      return res.status(400).send({ message: 'Un utilisateur avec ce login existe déjà.' });
    }

    const newUser = await User.create({
      login,
      password: hashedPassword,
      First_Name,
      Last_Name,
      E_mail,
      role: 'ouvrier',
      ouvrierId: newOuvrier.id,
      must_change_password: true
    });

    const mailOptions = {
      from: 'votre_email@gmail.com',
      to: E_mail,
      subject: 'Vos informations de connexion',
      text: `Bonjour ${First_Name},\n\nVoici vos informations de connexion :\nLogin : ${login}\nMot de passe temporaire : ${securePassword}.\n\nCordialement,\nAgri Data Consuting`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email envoyé: ' + info.response);
      }
    });

    res.status(201).send({ 
      ouvrier: newOuvrier,
      message: "L'ouvrier a été ajouté avec succès. Les informations de connexion ont été envoyées par e-mail."
    });
  } catch (err) {
    console.error('Erreur lors de l\'ajout de l\'ouvrier :', err);
    res.status(500).send({ message: 'Erreur lors de l\'ajout de l\'ouvrier', error: err.message });
  }
});
router.get('/getAllOuvriers', async (req, res) => {
  try {
    const ouvriers = await Ouvrier.findAll({
      attributes: ['id', 'First_Name', 'Last_Name', 'CIN', 'telephone', 'E_mail', 'date_de_naissance', 'photo', 'nombre_absences']
    });
    res.status(200).send(ouvriers);
  } catch (err) {
    console.error('Erreur lors de la récupération des ouvriers :', err);
    res.status(500).send(err);
  }
});

router.get('/ouvriers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ouvrier = await Ouvrier.findByPk(id);
    
    if (ouvrier) {
      res.status(200).send(ouvrier);
    } else {
      res.status(404).send({ message: 'Ouvrier non trouvé' });
    }
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'ouvrier par ID :', err);
    res.status(500).send(err);
  }
});

router.put('/updateOuvrier/:id', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { First_Name, Last_Name, CIN, telephone, E_mail, date_de_naissance } = req.body;
    const updatedFields = {
      First_Name,
      Last_Name,
      CIN,
      telephone,
      E_mail,
      date_de_naissance
    };

    if (req.file) {
      updatedFields.photo = req.file.path;
    }

    const [updated] = await Ouvrier.update(updatedFields, { where: { id } });

    if (updated) {
      const updatedOuvrier = await Ouvrier.findByPk(id);
      
      const login = `${First_Name.toLowerCase()}_${Last_Name.toLowerCase()}`;
      const user = await User.findOne({ where: { ouvrierId: id } });
      if (user) {
        await user.update({ 
          ...updatedFields, 
          login, 
          role: 'ouvrier'
        });
      }

      res.status(200).send({ ouvrier: updatedOuvrier, user });
    } else {
      res.status(404).send({ message: 'Ouvrier non trouvé' });
    }
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'ouvrier :', err);
    res.status(500).send(err);
  }
});

router.delete('/deleteOuvrier/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ouvrier = await Ouvrier.findByPk(id);
    if (!ouvrier) {
      return res.status(404).send({ message: 'Ouvrier non trouvé' });
    }

    await Ouvrier.destroy({ where: { id } });

    await User.destroy({ where: { ouvrierId: id } });

    res.status(200).send({ message: 'Ouvrier et utilisateur associé supprimés avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'ouvrier :', err);
    res.status(500).send(err);
  }
});

router.get('/exists', async (req, res) => {
  try {
    const { CIN } = req.query;

    const existingOuvrier = await Ouvrier.findOne({
      where: { CIN }
    });

    if (existingOuvrier) {
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'existence de l\'ouvrier :', err);
    res.status(500).send(err);
  }
});

router.get('/informations/:ouvrier_id', authMiddleware(['ouvrier']), async (req, res) => {
  try {
    console.log('User:', req.user);

    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const ouvrierId = parseInt(req.params.ouvrier_id);

    if (req.user.role !== 'ouvrier') {
      return res.status(403).json({ message: "Accès interdit" });
    }

    const ouvrier = await Ouvrier.findByPk(ouvrierId);

    if (!ouvrier) {
      return res.status(404).json({ message: "Ouvrier non trouvé" });
    }

    res.json(ouvrier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});


router.get('/heures-travaillees/:ouvrier_id',authMiddleware(['ouvrier']), async (req, res) => {
  try {
    const ouvrier_id = parseInt(req.params.ouvrier_id, 10);
    
    const pointages = await Pointage.findAll({
      where: {
        ouvrier_id
      },
      order: [['date_heure_entree', 'ASC']]
    });

    if (!pointages || pointages.length === 0) {
      return res.status(404).send({ message: 'Aucun pointage trouvé.' });
    }

    let totalHoursWorked = 0;
    const detailsPointages = pointages.map(pointage => {
      const entree = moment(pointage.date_heure_entree).tz(timezone); 
      const sortie = pointage.date_heure_sortie ? moment(pointage.date_heure_sortie).tz(timezone) : null; 
      const hoursWorked = sortie ? sortie.diff(entree, 'hours', true) : 0;
      totalHoursWorked += hoursWorked;

      return {
        id: pointage.id,
        entree: entree.format('YYYY-MM-DD HH:mm:ss'),
        sortie: sortie ? sortie.format('YYYY-MM-DD HH:mm:ss') : 'N/A',
        hoursWorked: hoursWorked.toFixed(2) + ' heures'
      };
    });
    
    res.status(200).send({
      totalHoursWorked: totalHoursWorked.toFixed(2) + ' heures',
      details: detailsPointages
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des heures travaillées :', err.message);
    res.status(500).send({ message: 'Erreur interne du serveur', error: err.message });
  }
});
router.get('/heures-par-jour/:id', authMiddleware(['ouvrier']), async (req, res) => {
  const ouvrierId = parseInt(req.params.id, 10);

  try {
    const heuresParJour = await Pointage.findAll({
      attributes: [
        [fn('DATE', col('date_heure_entree')), 'date'],
        [fn('SUM', fn('TIMESTAMPDIFF', literal('HOUR'), col('date_heure_entree'), col('date_heure_sortie'))), 'heures']
      ],
      where: {
        ouvrier_id: ouvrierId,
        date_heure_sortie: {
          [Op.not]: null 
        }
      },
      group: [fn('DATE', col('date_heure_entree'))],
      order: [fn('DATE', col('date_heure_entree'))],
      limit: 30
    });

    const formattedHeuresParJour = heuresParJour.map(row => ({
      date: row.dataValues.date,
      heures: parseFloat(row.dataValues.heures)
    }));

    res.json(formattedHeuresParJour);
  } catch (error) {
    console.error('Erreur lors de la récupération des heures par jour:', error);
    res.status(500).json({ message: "Erreur lors de la récupération des données" });
  }
});
router.get('/absences/:ouvrier_id', authMiddleware(['ouvrier', 'admin']), async (req, res) => {
  try {
    const { ouvrier_id } = req.params;

    console.log('User role:', req.user.role);
    console.log('User ouvrierId:', req.user.ouvrierId);
    console.log('Requested ouvrier_id:', ouvrier_id);

    if (req.user.role === 'ouvrier' && req.user.ouvrierId && req.user.ouvrierId !== parseInt(ouvrier_id)) {
      return res.status(403).send({ message: "Accès refusé. Vous ne pouvez consulter que vos propres informations." });
    }

    const ouvrier = await Ouvrier.findByPk(ouvrier_id, {
      attributes: ['id', 'First_Name', 'Last_Name', 'nombre_absences']
    });

    if (!ouvrier) {
      return res.status(404).send({ message: 'Ouvrier non trouvé.' });
    }

    res.status(200).send({ 
      ouvrier_id: ouvrier.id, 
      First_Name: ouvrier.First_Name, 
      Last_Name: ouvrier.Last_Name, 
      nombre_absences: ouvrier.nombre_absences 
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du nombre d\'absences :', err.message);
    res.status(500).send({ message: err.message });
  }
});

router.get('/settings/:ouvrier_id', authMiddleware(), async (req, res) => {
  try {
    const ouvrierId = parseInt(req.params.ouvrier_id, 10);

   
    const ouvrier = await Ouvrier.findByPk(ouvrierId, {
      attributes: ['id', 'First_Name', 'Last_Name', 'CIN', 'telephone', 'E_mail', 'date_de_naissance', 'photo']
    });

    if (!ouvrier) {
      return res.status(404).json({ message: "Ouvrier non trouvé" });
    }

    res.json(ouvrier);
  } catch (err) {
    console.error('Erreur lors de la récupération des paramètres de l\'ouvrier :', err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});



router.put('/settings/:ouvrier_id', upload.single('photo'), async (req, res) => {
  try {
    const ouvrierId = parseInt(req.params.ouvrier_id, 10);
    const { First_Name, Last_Name, telephone, E_mail, login, newPassword, confirmPassword } = req.body;

    if (newPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
    }

    const updatedFields = {
      First_Name,
      Last_Name,
      telephone,
      E_mail
    };

    if (req.file) {
      updatedFields.photo = req.file.path;
    }

    const [updated] = await Ouvrier.update(updatedFields, { where: { id: ouvrierId } });

    if (updated) {
      const user = await User.findOne({ where: { ouvrierId } });
      if (user) {
        await user.update({ 
          First_Name, 
          Last_Name, 
          E_mail,
          login
        });

        if (newPassword) {
          const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
          await user.update({ password: hashedPassword });
        }
      }

      const updatedOuvrier = await Ouvrier.findByPk(ouvrierId, {
        attributes: ['id', 'First_Name', 'Last_Name', 'CIN', 'telephone', 'E_mail', 'date_de_naissance', 'photo']
      });

      res.status(200).json({ 
        message: "Informations mises à jour avec succès",
        ouvrier: updatedOuvrier
      });
    } else {
      res.status(404).json({ message: 'Ouvrier non trouvé' });
    }
  } catch (err) {
    console.error('Erreur lors de la mise à jour des paramètres de l\'ouvrier :', err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

router.get('/settings/:ouvrierId', authMiddleware(['ouvrier', 'admin']), async (req, res) => {
  try {
    const ouvrierId = parseInt(req.params.ouvrierId, 10);

    const ouvrier = await Ouvrier.findByPk(ouvrierId, {
      attributes: ['id', 'First_Name', 'Last_Name', 'CIN', 'telephone', 'E_mail', 'date_de_naissance', 'photo']
    });

    if (!ouvrier) {
      return res.status(404).json({ message: "Ouvrier non trouvé" });
    }

    res.json(ouvrier);
  } catch (err) {
    console.error('Erreur lors de la récupération des paramètres de l\'ouvrier :', err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});


router.put('/settings/credentials/:ouvrierId', authMiddleware(['ouvrier']), async (req, res) => {
  try {
    const ouvrierId = parseInt(req.params.ouvrierId, 10);
    const { currentPassword, newLogin, newPassword } = req.body;

    if (ouvrierId !== req.user.ouvrierId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier les identifiants d'un autre ouvrier" });
    }

    const user = await User.findOne({ where: { ouvrierId } });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect" });
    }

    if (newLogin) {
      const loginExists = await User.findOne({ where: { login: newLogin } });
      if (loginExists && loginExists.id !== user.id) {
        return res.status(400).json({ message: "Ce login est déjà utilisé" });
      }
      user.login = newLogin;
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({ message: "Identifiants mis à jour avec succès" });
  } catch (err) {
    console.error('Erreur lors de la mise à jour des identifiants :', err);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});
module.exports = router;


