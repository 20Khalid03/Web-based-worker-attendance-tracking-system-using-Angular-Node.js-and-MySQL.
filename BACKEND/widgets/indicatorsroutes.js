const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../db');
const Pointage = require('../pointage/pointage');

function adjustEndDate(endDate) {
    let adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    return adjustedEndDate.toISOString().split('T')[0];
}

router.get('/hours-worked', async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
        endDate = adjustEndDate(endDate);

        const result = await Pointage.findAll({
            attributes: [
                [fn('DATE', col('date_heure_entree')), 'date'],
                [sequelize.literal('ROUND(SUM(TIMESTAMPDIFF(MINUTE, date_heure_entree, date_heure_sortie) / 60), 2)'), 'total_hours']
            ],
            where: {
                date_heure_entree: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            },
            group: [fn('DATE', col('date_heure_entree'))],
            order: [[fn('DATE', col('date_heure_entree')), 'ASC']]
        });
        

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/average-hours-worked', async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
        endDate = adjustEndDate(endDate);

        const result = await Pointage.findAll({
            attributes: [
                [fn('DATE', col('date_heure_entree')), 'date'],
                [fn('AVG', fn('TIMESTAMPDIFF', literal('HOUR'), col('date_heure_entree'), col('date_heure_sortie'))), 'avg_hours']
            ],
            where: {
                date_heure_entree: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            },
            group: [fn('DATE', col('date_heure_entree'))],
            order: [[fn('DATE', col('date_heure_entree')), 'ASC']]
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/days-worked', async (req, res) => {
    try {
        let { startDate, endDate } = req.query;
        endDate = adjustEndDate(endDate);

        const result = await Pointage.findAll({
            attributes: [
                [fn('DATE', col('date_heure_entree')), 'date'],
                [fn('COUNT', fn('DISTINCT', fn('DATE', col('date_heure_entree')))), 'days_worked']
            ],
            where: {
                date_heure_entree: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            },
            group: [fn('DATE', col('date_heure_entree'))],
            order: [[fn('DATE', col('date_heure_entree')), 'ASC']]
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;