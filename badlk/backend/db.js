// backend/db.js
const knex = require('knex');
const { DATABASE_URL } = require('./config');

const isSqlite = DATABASE_URL && DATABASE_URL.startsWith('sqlite:');
const sqliteFile = isSqlite ? DATABASE_URL.replace(/^sqlite:/, '') : null;

const db = knex(
  isSqlite
    ? { client: 'sqlite3', connection: { filename: sqliteFile }, useNullAsDefault: true }
    : { client: 'pg', connection: DATABASE_URL }
);

module.exports = db;
