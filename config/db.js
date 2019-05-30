const config = require('dotenv').config().parsed
const Pool = require('pg').Pool

const pool = new Pool({
	port: config.DB_PORT,
	user: config.DB_USER,
	host: config.DB_HOST,
	password: config.DB_PASSWORD,
	database: config.DB_NAME,
})

module.exports = pool
