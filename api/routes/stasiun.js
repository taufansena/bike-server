const express = require('express')
const router = express.Router()
const pool = require('../../config/db')

router.get('/', (req, res) => {
	pool.query('SELECT * FROM stasiun', (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json(results.rows)
	})
})

router.get('/:stasiunId', (req, res) => {
	const id = req.params.stasiunId
	pool.query('SELECT * FROM stasiun WHERE id_stasiun = $1', [ id ], (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json(results.rows)
	})
})

router.post('/', (req, res) => {
	const stasiun = {
		id_stasiun: req.body.id,
		alamat: req.body.alamat,
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		nama: req.body.nama
	}
	pool.connect((error, client, done) => {
		client.query('BEGIN')
		if (checkerror(error, res, client, done)) return

		client.query(
			`INSERT INTO stasiun 
			("id_stasiun", "alamat", "latitude", "longitude", "nama") 
			VALUES ($1, $2, $3, $4, $5)`,
			[ 'ST' + stasiun.id_stasiun, stasiun.alamat, stasiun.latitude, stasiun.longitude, stasiun.nama ],
			(err) => {
				if (checkerror(err, res, client, done)) return

				client.query('COMMIT', (error) => {
					if (checkerror(error, res, client, done)) return
					res.status(200).json({
						message: 'Insert Data Success'
					})
					done()
				})
			}
		)
	})
})

router.patch('/:stasiunId', (req, res) => {
	const id = req.params.stasiunId
	const stasiun = {
		alamat: req.body.alamat,
		latitude: req.body.latitude,
		longitude: req.body.longitude,
		nama: req.body.nama
	}
	pool.query(
		`UPDATE stasiun SET 
		"alamat" = $1, "latitude" = $2, "longitude" = $3,
		"nama" = $4 WHERE id_stasiun = $5`,
		[ stasiun.alamat, stasiun.latitude, stasiun.longitude, stasiun.nama, id ],
		(error, results) => {
			if (checkerror(error, res)) return
			res.status(200).json({
				message: 'Update Data Success'
			})
		}
	)
})

router.delete('/:stasiunId', (req, res) => {
	const id = req.params.stasiunId
	pool.query('DELETE FROM stasiun WHERE id_stasiun = $1', [ id ], (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json({
			message: 'Hapus Data Success'
		})
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
