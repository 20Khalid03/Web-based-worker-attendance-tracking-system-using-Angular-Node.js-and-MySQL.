const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Pointage = sequelize.define('pointage', {
  date_heure_entree: {
    type: DataTypes.DATE,
    allowNull: false
  },
  date_heure_sortie: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ouvrier_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'ouvriers',
      key: 'id'
    }
  },
  sequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'pointage',
  timestamps: false
});

module.exports = Pointage;
