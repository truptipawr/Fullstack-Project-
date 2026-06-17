
// This is like Python's database connection setup
const mysql = require('mysql2');
require('dotenv').config();

// Create a "pool" of connections (more efficient than one connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // localhost
  user: process.env.DB_USER,       // root
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// This lets us use async/await (like Python's async) instead of callbacks
module.exports = pool.promise();