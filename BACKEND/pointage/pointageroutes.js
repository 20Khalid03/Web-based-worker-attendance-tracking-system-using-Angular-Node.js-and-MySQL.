const express = require('express');
const router = express.Router();
const Pointage = require('./pointage');
const Ouvrier = require('../ouvriers/ouvrier');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const { sendNotificationToAllDevices } = require('./notificationService');
require('dotenv').config();

const timezone = 'Africa/Casablanca';

const verifyOuvrierId = (id) => {
  const ouvrierId = parseInt(id, 10);
  if (isNaN(ouvrierId)) {
    throw new Error('ID de l\'ouvrier invalide.');
  }
  return ouvrierId;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'khalidahrour123@gmail.com',
    pass: 'caga knsl tdfd opig'
  }
});

router.post('/verifier-absences', async (req, res) => {
  try {
    const now = moment().tz(timezone);
    const startOf24HoursAgo = now.clone().subtract(24, 'hours').toDate();

    const ouvriers = await Ouvrier.findAll();

    for (const ouvrier of ouvriers) {
      const dernierPointage = await Pointage.findOne({
        where: {
          ouvrier_id: ouvrier.id,
          date_heure_entree: {
            [Op.gte]: startOf24HoursAgo
          }
        }
      });

      if (!dernierPointage) {
        await Ouvrier.update(
          { nombre_absences: ouvrier.nombre_absences + 1 },
          { where: { id: ouvrier.id } }
        );

        await transporter.sendMail({
          from: 'khalidahrour123@gmail.com',
          to: ouvrier.E_mail,
          subject: 'Absence non signalée',
          text: `Bonjour ${ouvrier.First_Name},\n\nNous avons constaté que vous n'avez pas pointé aujourd'hui. Une absence a été enregistrée dans votre dossier.\n\nCordialement,\nL'équipe agri Data.`
        });
      }
    }

    res.status(200).send({ message: 'Vérification des absences effectuée et mises à jour.' });
  } catch (err) {
    console.error('Erreur lors de la vérification des absences :', err.message);
    res.status(500).send({ message: err.message });
  }
});

router.post('/verifier-absences-notification', async (req, res) => {
  try {
    const now = moment().tz(timezone);
    const startOf24HoursAgo = now.clone().subtract(24, 'hours').toDate();
    
    const ouvriersAbsents = [];
    const ouvriers = await Ouvrier.findAll();

    for (const ouvrier of ouvriers) {
      const dernierPointage = await Pointage.findOne({
        where: {
          ouvrier_id: ouvrier.id,
          date_heure_entree: {
            [Op.gte]: startOf24HoursAgo
          }
        }
      });

      if (!dernierPointage) {
        ouvriersAbsents.push(ouvrier.First_Name + ' ' + ouvrier.Last_Name);

        await Ouvrier.update(
          { nombre_absences: ouvrier.nombre_absences + 1 },
          { where: { id: ouvrier.id } }
        );
      }
    }

    if (ouvriersAbsents.length > 0) {
      const message = `Les ouvriers suivants sont absents : ${ouvriersAbsents.join(', ')}`;

      await sendNotificationToAllDevices('Absences détectées', message);
      
      await transporter.sendMail({
        from: 'khalidahrour123@gmail.com',
        to: 'khalidahrour123@gmail.com',
        subject: 'Liste des absences',
        text: `Bonjour,\n\nVoici la liste des ouvriers absents : ${ouvriersAbsents.join(', ')}.\n\nCordialement,\nL'équipe agri Data.`
      });
      
      res.status(200).send({ message: 'Absences détectées, notification et email envoyés aux administrateurs.', absents: ouvriersAbsents });
    } else {
      res.status(200).send({ message: 'Aucune absence détectée.' });
    }
  } catch (err) {
    console.error('Erreur lors de la vérification des absences :', err.message);
    res.status(500).send({ message: err.message });
  }
});


router.get('/absents', async (req, res) => {
  try {
    const dateParam = req.query.date;
    const date = dateParam ? moment(dateParam).tz(timezone) : moment().tz(timezone);
    const startOfDay = date.clone().startOf('day').toDate();
    const endOfDay = date.clone().endOf('day').toDate();

    const ouvriers = await Ouvrier.findAll();
    const absents = [];

    for (const ouvrier of ouvriers) {
      const dernierPointage = await Pointage.findOne({
        where: {
          ouvrier_id: ouvrier.id,
          date_heure_entree: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      });

      if (!dernierPointage) {
        absents.push({
          id: ouvrier.id,
          firstName: ouvrier.First_Name,
          lastName: ouvrier.Last_Name,
          absenceDate: date.format('YYYY-MM-DD')
        });
      }
    }

    res.status(200).json(absents);
  } catch (err) {
    console.error('Erreur lors de la récupération des absents :', err.message);
    res.status(500).send({ message: err.message });
  }
});


router.post('/entree/:ouvrier_id', async (req, res) => {
  try {
    const ouvrier_id = verifyOuvrierId(req.params.ouvrier_id);
    const today = moment().tz(timezone).startOf('day');

    const dernierPointage = await Pointage.findOne({
      where: {
        ouvrier_id,
        date_heure_entree: {
          [Op.gte]: today.toDate()
        }
      },
      order: [['sequence', 'DESC']]
    });

    let sequence = 1;
    if (dernierPointage) {
      sequence = dernierPointage.sequence + 1;
    }

    const pointage = await Pointage.create({
      date_heure_entree: moment().tz(timezone).toDate(),
      ouvrier_id,
      sequence
    });
    res.status(201).send(pointage);
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement de l\'entrée :', err.message);
    res.status(500).send({ message: err.message });
  }
});

router.post('/sortie/:ouvrier_id', async (req, res) => {
  try {
    const ouvrier_id = verifyOuvrierId(req.params.ouvrier_id);
    const pointage = await Pointage.findOne({
      where: {
        ouvrier_id,
        date_heure_sortie: null
      },
      order: [['sequence', 'DESC']]
    });

    if (pointage) {
      pointage.date_heure_sortie = moment().tz(timezone).toDate();
      await pointage.save();
      res.status(200).send(pointage);
    } else {
      res.status(404).send({ message: 'Aucun pointage d\'entrée trouvé pour cet ouvrier.' });
    }
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement de la sortie :', err.message);
    res.status(500).send({ message: err.message });
  }
});

router.post('/reset/:ouvrier_id', async (req, res) => {
  try {
    const ouvrier_id = verifyOuvrierId(req.params.ouvrier_id);
    const today = moment().tz(timezone).startOf('day');

    const dernierPointage = await Pointage.findOne({
      where: {
        ouvrier_id,
        date_heure_entree: {
          [Op.gte]: today.toDate()
        }
      },
      order: [['date_heure_entree', 'DESC']]
    });

    if (dernierPointage && !dernierPointage.date_heure_sortie) {
      dernierPointage.date_heure_sortie = null;
      await dernierPointage.save();
    }

    res.status(200).send({ message: 'Pointage réinitialisé avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la réinitialisation du pointage :', err.message);
    res.status(500).send({ message: err.message });
  }
});

router.post('/preparer-nouveau/:ouvrier_id', async (req, res) => {
  try {
    const ouvrier_id = verifyOuvrierId(req.params.ouvrier_id);
    const today = moment().tz(timezone).startOf('day');

    const dernierPointage = await Pointage.findOne({
      where: {
        ouvrier_id,
        date_heure_entree: {
          [Op.gte]: today.toDate()
        }
      },
      order: [['date_heure_entree', 'DESC']]
    });

    if (dernierPointage && !dernierPointage.date_heure_sortie) {
      dernierPointage.date_heure_sortie = moment().tz(timezone).toDate();
      await dernierPointage.save();
    }

    res.status(200).send({ message: 'Pointage réinitialisé avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la réinitialisation du pointage :', err.message);
    res.status(500).send({ message: err.message });
  }
});
router.get('/', async (req, res) => {
  try {
    const pointages = await Pointage.findAll({
      include: {
        model: Ouvrier,
        as: 'ouvrier'
      }
    });

    const formattedPointages = pointages.map(pointage => ({
      ...pointage.toJSON(),
      date_heure_entree: moment(pointage.date_heure_entree).tz(timezone).format(),
      date_heure_sortie: pointage.date_heure_sortie ? moment(pointage.date_heure_sortie).tz(timezone).format() : null
    }));

    res.status(200).send(formattedPointages);
  } catch (err) {
    console.error('Erreur lors de la récupération des pointages :', err.message);
    res.status(500).send({ message: err.message });
  }
});
router.delete('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await Pointage.destroy({
      where: {
        date_heure_entree: {
          [Op.startsWith]: date
        }
      }
    });
    res.status(200).json({ message: `Pointages supprimés pour la date ${date}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Pointage.destroy({
      where: {
        id
      }
    });

    if (deleted) {
      res.status(200).send({ message: 'Pointage supprimé avec succès.' });
    } else {
      res.status(404).send({ message: 'Pointage non trouvé.' });
    }
  } catch (err) {
    console.error('Erreur lors de la suppression du pointage :', err.message);
    res.status(500).send({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date_heure_entree, date_heure_sortie } = req.body;

    const pointage = await Pointage.findByPk(id);

    if (!pointage) {
      return res.status(404).send({ message: 'Pointage non trouvé.' });
    }

    if (date_heure_entree) pointage.date_heure_entree = moment(date_heure_entree).tz(timezone).toDate();
    if (date_heure_sortie) pointage.date_heure_sortie = moment(date_heure_sortie).tz(timezone).toDate();

    await pointage.save();

    res.status(200).send(pointage);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du pointage :', err.message);
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
