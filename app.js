const express = require('express')
const app = express()
const path = require('path')

const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//api routes
app.use('/api/acara', require('./api/routes/acara'))
app.use('/api/person', require('./api/routes/person'))
app.use('/api/sepeda', require('./api/routes/sepeda'))
app.use('/api/penugasan', require('./api/routes/penugasan'))
app.use('/api/stasiun', require('./api/routes/stasiun'))
app.use('/api/voucher', require('./api/routes/voucher'))
app.use('/api/transaksi', require('./api/routes/transaksi'))
app.use('/api/peminjaman', require('./api/routes/peminjaman'))

//web routes
app.use(express.static(path.join(__dirname, './build')))
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, './build', 'index.html'))
})

//404 handler
app.use((req, res, next) => {
	const error = new Error('not found')
	next(error)
})

//error handler
app.use((error, req, res, next) => {
	res.status(404)
	res.json({
		error: {
			message: error.message
		}
	})
})

module.exports = app
