const express = require('express')
const router = express.Router()
const pool = require('../../config/db')

router.get('/', (req, res, next) => {
	pool.query('SELECT * FROM transaksi', (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json(results.rows)
	})
})

const checkerror = (error, res, client, done) => {
	if (error) {
		console.log(error)
		res.status(500).json({
			message: error
		})
		if (done) {
			client.query('ROLLBACK')
			done()
		}
	}
	return !!error
}

module.exports = router
