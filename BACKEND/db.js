const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('gestion_des_ouvriers', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

sequelize.authenticate()
  .then(() => {
    console.log('Connexion à la base de données MySQL réussie');
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données :', err);
  });

module.exports = sequelize;
