const express = require('express')
const router = express.Router()
const pool = require('../../config/db')

router.get('/', (req, res) => {
	pool.query(
		`SELECT 
			pn.ktp as ktp,  
			pn.tgl_mulai as mulai,
			pn.tgl_selesai as selesai,
			ps.nama as petugas,
			string_agg(st.nama, ', ') as stasiun,
			string_agg(st.id_stasiun, ', ') as id_stasiun
		FROM penugasan as pn
		JOIN person as ps 
		ON pn.ktp = ps.ktp
		JOIN stasiun as st
		ON st.id_stasiun = pn.id_stasiun
		GROUP BY pn.ktp, pn.tgl_mulai, pn.tgl_selesai, ps.nama`,
		(error, results) => {
			if (checkerror(error, res)) return
			res.status(200).json(results.rows)
		}
	)
})

router.get('/:penugasanId', (req, res) => {
	const id = req.params.penugasanId
	pool.query('SELECT * FROM penugasan WHERE ktp = $1', [ id ], (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json(results.rows)
	})
})

router.post('/', (req, res) => {
	const penugasan = {
		ktp: req.body.ktp,
		tgl_mulai: req.body.tgl_mulai,
		tgl_selesai: req.body.tgl_selesai,
		id_stasiun: req.body.id_stasiun
	}
	pool.connect((error, client, done) => {
		client.query('BEGIN')
		if (checkerror(error, res, client, done)) return

		for (i = 0; i < penugasan.id_stasiun.length; i++) {
			client.query(
				`INSERT INTO penugasan 
				("ktp", "tgl_mulai", "tgl_selesai", "id_stasiun") 
				VALUES ($1, $2, $3, $4)`,
				[ penugasan.ktp, penugasan.tgl_mulai, penugasan.tgl_selesai, penugasan.id_stasiun[i].value ],
				(err) => {
					if (checkerror(err, res, client, done)) return
				}
			)
		}

		client.query('COMMIT', (er) => {
			if (checkerror(er, res, client, done)) return
			res.status(200).json({
				message: 'Insert Data Success'
			})
			done()
		})
	})
})

router.patch('/:penugasanId', (req, res) => {
	const id = req.params.penugasanId
	const penugasan = {
		tgl_mulai: req.body.tgl_mulai,
		tgl_selesai: req.body.tgl_selesai,
		id_stasiun: req.body.id_stasiun
	}
	pool.query(
		`UPDATE penugasan SET 
		"tgl_mulai" = $1, "tgl_selesai" = $2, "id_stasiun" = $3 WHERE ktp = $4`,
		[ penugasan.tgl_mulai, penugasan.tgl_selesai, penugasan.id_stasiun, id ],
		(error) => {
			if (checkerror(error, res)) return
			res.status(200).json({
				message: 'Update Data Success'
			})
		}
	)
})

router.delete('/:penugasanId', (req, res) => {
	const id = req.params.penugasanId
	pool.query('DELETE FROM penugasan WHERE ktp = $1', [ id ], (error, results) => {
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
