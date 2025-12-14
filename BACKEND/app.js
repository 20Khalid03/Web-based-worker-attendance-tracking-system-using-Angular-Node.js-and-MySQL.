const express = require('express');
const cors = require('cors');
const db = require('./db');
const ouvrierRoutes = require('./ouvriers/routes');
const authRoute = require('./users/authroute');
const pointageRoutes = require('./pointage/pointageroutes');
const indicatorsRoutes = require('./widgets/indicatorsroutes');
const graphDataRoutes = require('./visualisations/graphDataRoutes'); 
const cronJobs = require('./pointage/cron');

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Serveur Express avec MySQL fonctionne correctement');
});

app.use('/api/auth', authRoute);
app.use('/ouvriers', ouvrierRoutes);
app.use('/api/pointage', pointageRoutes);
app.use('/api/indicators', indicatorsRoutes);
app.use('/api/visualisation', graphDataRoutes); 
cronJobs.start();

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
