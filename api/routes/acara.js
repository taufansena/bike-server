const express = require('express')
const router = express.Router()
const pool = require('../../config/db')

router.get('/', (req, res) => {
	pool.query(
		`SELECT 
			ac.id_acara as id, 
			ac.judul as judul, 
			ac.deskripsi as deskripsi, 
			ac.tgl_mulai as mulai,
			ac.tgl_selesai as selesai, 
			ac.gratis as gratis,
			string_agg(st.nama, ', ') as stasiun,
			string_agg(st.id_stasiun, ', ') as id_stasiun
		FROM acara as ac
		JOIN acara_stasiun as ast
		ON ac.id_acara = ast.id_acara
		JOIN stasiun as st
		ON st.id_stasiun = ast.id_stasiun
		GROUP BY id`,
		(error, results) => {
			if (checkerror(error, res)) return
			res.status(200).json(results.rows)
		}
	)
})

router.get('/:acaraId', (req, res) => {
	const id = req.params.acaraId
	pool.query('SELECT * FROM acara WHERE id_acara = $1', [ id ], (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json(results.rows)
	})
})

router.post('/', (req, res) => {
	const acara = {
		id: req.body.id,
		judul: req.body.judul,
		deskripsi: req.body.deskripsi,
		gratis: req.body.gratis,
		mulai: req.body.mulai,
		selesai: req.body.selesai,
		stasiun: req.body.stasiun
	}
	pool.connect((error, client, done) => {
		client.query('BEGIN')
		if (checkerror(error, res, client, done)) return

		client.query(
			`INSERT INTO acara
			("id_acara", "judul", "deskripsi", "gratis", "tgl_mulai", "tgl_selesai") 
			VALUES ($1, $2, $3, $4, $5, $6)`,
			[ 'ACR' + acara.id, acara.judul, acara.deskripsi, acara.gratis, acara.mulai, acara.selesai ],
			(err) => {
				if (checkerror(err, res, client, done)) return
				for (i = 0; i < acara.stasiun.length; i++) {
					client.query(
						`INSERT INTO acara_stasiun ("id_acara", "id_stasiun") VALUES ($1, $2)`,
						[ 'ACR' + acara.id, acara.stasiun[i].value ],
						(er) => {
							if (checkerror(er, res, client, done)) return
						}
					)
				}

				client.query('COMMIT', (e) => {
					if (checkerror(e, res, client, done)) return
					res.status(200).json({
						message: 'Insert Data Success'
					})
					done()
				})
			}
		)
	})
})

router.patch('/:acaraId', (req, res) => {
	const id = req.params.acaraId
	const acara = {
		judul: req.body.judul,
		deskripsi: req.body.deskripsi,
		gratis: req.body.gratis,
		mulai: req.body.mulai,
		selesai: req.body.selesai,
		stasiun: req.body.stasiun
	}

	pool.connect((error, client, done) => {
		client.query('BEGIN')
		checkerror(error, res, client, done)

		client.query(
			`UPDATE acara SET 
			"judul" = $1, "deskripsi" = $2, "gratis" = $3, "tgl_mulai" = $4,
			"tgl_selesai" = $5 WHERE id_acara = $7`,
			[ acara.judul, acara.deskripsi, acara.gratis, acara.mulai, acara.selesai, acara.stasiun, id ],
			(err) => {
				checkerror(err, res, client, done)

				client.query(`DELETE FROM acara_stasiun where id_acara = $1`, [ id ], (er) => {
					checkerror(er, res, client, done)

					for (i = 0; i < acara.stasiun.lenght; i++) {
						client.query(
							`INSERT INTO acara_stasiun
					("id_acara", "id_stasiun") VALUES ($1, $2)`,
							[ id, acara.stasiun[i] ],
							(e) => {
								checkerror(e, res, client, done)
							}
						)
					}

					client.query('COMMIT', (errorm) => {
						checkerror(errorm, res, client, done)
						res.status(200).json({
							message: 'Edit Data Success'
						})
						done()
					})
				})
			}
		)
	})
})

router.delete('/:acaraId', (req, res) => {
	const id = req.params.acaraId
	pool.query('DELETE FROM acara WHERE id_acara = $1', [ id ], (error) => {
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
