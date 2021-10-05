const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const db = require('./db');

const Subject = db.define('subject', {
  name: {
    type: Sequelize.STRING,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
});

module.exports = Subject;
