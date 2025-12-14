const moment = require('moment-timezone');
console.log('Heure actuelle:', moment().tz('Africa/Casablanca').format('YYYY-MM-DD HH:mm:ss'));
