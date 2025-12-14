const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment-timezone');
const config = require('./config');

const timezone = 'Africa/Casablanca';

const verifierAbsences = async () => {
  try {
    console.log('Tentative de vérification des absences...');
    const response = await axios.post(`${config.apiUrl}/api/pointage/verifier-absences`);
    console.log(`Vérification des absences effectuée à ${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}:`, response.data);
  } catch (error) {
    console.error(`Erreur lors de la vérification des absences à ${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}:`, error.message);
  }
};

const verifierAbsencesNotification = async () => {
  try {
    console.log('Tentative d\'envoi de notification...');
    const response = await axios.post(`${config.apiUrl}/api/pointage/verifier-absences-notification`);
    console.log(`Notification envoyée à ${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}:`, response.data);
  } catch (error) {
    console.error(`Erreur lors de l'envoi des notifications à ${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}:`, error.message);
  }
};

cron.schedule('0 12 * * *', () => { 

  console.log(`Exécution de la vérification des absences à 12h00 ${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}`);
  verifierAbsencesNotification();
  verifierAbsences();
});
cron.schedule('0 18 * * *', () => { 
  console.log(`Exécution de la vérification des absences notifications à 18h00 ${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}`);
  verifierAbsencesNotification();
  verifierAbsences();

});
cron.schedule('54 12 * * *', () => { 
  console.log(`Exécution de la vérification des absences notifications${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}`);
  verifierAbsencesNotification();
  verifierAbsences();

});
cron.schedule('1 14 * * *', () => { 
  console.log(`Exécution de la vérification des absences notifications ${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}`);
  verifierAbsencesNotification();
  verifierAbsences();

});
cron.schedule('51 20 * * *', () => { 
  console.log(`Exécution de la vérification des absences notifications  ${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}`);
  verifierAbsencesNotification();
  verifierAbsences();

});
cron.schedule('3 00 * * *', () => { 
  console.log(`Exécution de la vérification des absences notifications  ${moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}`);
  verifierAbsencesNotification();
  verifierAbsences();

});


module.exports = {
  start: () => {
    console.log('Démarrage des tâches cron');
  }
};
