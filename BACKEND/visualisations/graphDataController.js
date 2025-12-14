const { Op, fn, col, literal } = require('sequelize');
const Pointage = require('../pointage/pointage');
const Ouvrier = require('../ouvriers/ouvrier');
const verifyRole = require('./verifyRole'); 

exports.getHoursWorked = [
  async (req, res) => {
    const { start, end } = req.query;

    try {
      const pointages = await Pointage.findAll({
        attributes: [
          [fn('DATE', col('date_heure_entree')), 'date'],
          [fn('SUM', literal('TIMESTAMPDIFF(SECOND, date_heure_entree, date_heure_sortie) / 3600')), 'total_hours']
        ],
        where: {
          date_heure_entree: {
            [Op.between]: [new Date(start), new Date(end)]
          }
        },
        group: ['date']
      });

      const labels = pointages.map(p => p.dataValues.date);
      const values = pointages.map(p => parseFloat(p.dataValues.total_hours) || 0);

      res.json({ barData: { labels, values }, lineData: { labels, values } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getTopProductiveWorkers = [
  async (req, res) => {
    try {
      const pointages = await Pointage.findAll({
        attributes: [
          'ouvrier_id',
          [fn('SUM', literal('TIMESTAMPDIFF(SECOND, date_heure_entree, date_heure_sortie) / 3600')), 'total_hours']
        ],
        group: ['ouvrier_id'],
        order: [[fn('SUM', literal('TIMESTAMPDIFF(SECOND, date_heure_entree, date_heure_sortie) / 3600')), 'DESC']],
        limit: 10
      });

      const workerIds = pointages.map(p => p.dataValues.ouvrier_id);
      const workers = await Ouvrier.findAll({
        where: {
          id: workerIds
        }
      });

      const labels = workers.map(worker => `${worker.First_Name} ${worker.Last_Name}`);
      const values = pointages.map(p => parseFloat(p.dataValues.total_hours) || 0);

      res.json({ labels, values });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getWorkerReport = [
  async (req, res) => {
    try {
      const report = await Ouvrier.findAll({
        attributes: [
          'photo',
          'First_Name',
          'Last_Name',
          'CIN',
          'E_mail',
          [fn('SUM', literal('TIMESTAMPDIFF(SECOND, pointages.date_heure_entree, pointages.date_heure_sortie) / 3600')), 'total_hours'],
          'nombre_absences'
        ],
        include: [{
          model: Pointage,
          as: 'pointages',
          attributes: []
        }],
        group: ['Ouvrier.id'],
        raw: true
      });

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
