const { Client } = require('pg')
require('dotenv').config()
 
const db = new Client({
  host: process.env.PG_HOST,
  port: 5432,
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
})

module.exports = { db }