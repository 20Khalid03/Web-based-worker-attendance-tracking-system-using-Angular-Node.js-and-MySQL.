const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Pointage = require('../pointage/pointage');

const Ouvrier = sequelize.define('Ouvrier', {
  First_Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Last_Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  CIN: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  E_mail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_de_naissance: {
    type: DataTypes.DATE,
    allowNull: false
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nombre_absences: {  
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'ouvriers',
  timestamps: false
});

Ouvrier.hasMany(Pointage, { foreignKey: 'ouvrier_id', as: 'pointages' });
Pointage.belongsTo(Ouvrier, { foreignKey: 'ouvrier_id', as: 'ouvrier' });

module.exports = Ouvrier;
