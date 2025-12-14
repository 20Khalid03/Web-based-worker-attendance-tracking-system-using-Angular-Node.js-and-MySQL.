const express = require('express');
const router = express.Router();
const graphDataController = require('./graphDataController'); 

router.get('/hours-worked', graphDataController.getHoursWorked);

router.get('/top-workers', graphDataController.getTopProductiveWorkers);
router.get('/worker-report', graphDataController.getWorkerReport);

module.exports = router;
