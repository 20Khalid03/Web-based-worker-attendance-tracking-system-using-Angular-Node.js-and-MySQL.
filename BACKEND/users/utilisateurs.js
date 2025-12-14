const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Ouvrier = require('../ouvriers/ouvrier'); 

const User = sequelize.define('Utilisateurs', {
  login: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  First_Name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  Last_Name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  E_mail: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'ouvrier'),
    allowNull: false,
    defaultValue: 'ouvrier'
  },
  ouvrierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ouvriers',
      key: 'id'
    }
  },
  must_change_password: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: false
});

User.belongsTo(Ouvrier, { foreignKey: 'ouvrierId', as: 'ouvrier' });

module.exports = User;
