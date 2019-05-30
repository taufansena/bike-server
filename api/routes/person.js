const express = require('express')
const router = express.Router()
const pool = require('../../config/db')
const config = require('dotenv').config().parsed

router.get('/', (req, res, next) => {
	pool.query('SELECT * FROM person', (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json(results.rows)
	})
})

router.get('/:anggota', (req, res, next) => {
	pool.query(`SELECT 
				pe.ktp,
				pe.nama,
				an.no_kartu
			FROM person as pe
			JOIN anggota as an
			ON pe.ktp = an.ktp
			`, (error, results) => {
				if (checkerror(error, res)) return				
				res.status(200).json(results.rows)
	})
})

router.get('/:petugas', (req, res, next) => {
	pool.query(`SELECT 
				pe.ktp,
				pe.nama
			FROM person as pe
			JOIN petugas as ps
			ON pe.ktp = ps.ktp
			`, (error, results) => {
				if (checkerror(error, res)) return
				res.status(200).json(results.rows)
	})
})

router.get('/:personId', (req, res, next) => {
	const id = req.params.personId
	pool.query('SELECT * FROM person WHERE ktp = $1', [ id ], (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json(results.rows)
	})
})

router.post('/', (req, res) => {
	const person = {
		ktp: req.body.ktp,
		nama: req.body.nama,
		email: req.body.email,
		tanggal: req.body.tanggal,
		telepon: req.body.telepon,
		alamat: req.body.alamat,
		role: req.body.role
	}
	pool.connect((error, client, done) => {
		client.query('BEGIN')
		if (checkerror(error, res, client, done)) return

		client.query(
			`INSERT INTO person ("ktp", "nama", "email", "tgl_lahir", "no_telp", "alamat")
			VALUES ($1, $2, $3, $4, $5, $6)`, [ person.ktp, person.nama, person.email, person.tanggal, person.telepon, person.alamat ],
			(err1) => {
				if (checkerror(err1, res, client, done)) return

				if(person.role === 'anggota') {
					client.query(
						`INSERT INTO anggota ("no_kartu", "saldo", "point", "ktp") VALUES ($1, $2, $3, $4)`,
						[ 'A'+ person.ktp, 0, 0, person.ktp ],
						(err2) => {
							if (checkerror(err2, res, client, done)) return

							client.query('COMMIT', (err) => {
								if (checkerror(err, res, client, done)) return							
								done()
								res.status(200).json({
									message: 'Insert Data Success'
								})
							})
						}
					)
				} else {
					client.query(
						`INSERT INTO petugas ("ktp", "gaji") VALUES ($1, $2)`,
						[ person.ktp, 30000 ],
						(err2) => {
							if (checkerror(err2, res, client, done)) return

							client.query('COMMIT', (err) => {
								if (checkerror(err, res, client, done)) return							
								done()
								res.status(200).json({
									message: 'Insert Data Success'
								})
							})
						}
					)
				}
			}
		)
	})
})

router.patch('/:personId', (req, res, next) => {
	const id = req.params.personId
	const person = {
		ktp: req.body.ktp,
		nama: req.body.nama,
		email: req.body.email,
		tanggal: req.body.tanggal,
		telepon: req.body.telepon,
		alamat: req.body.alamat
	}
	pool.query(
		`UPDATE person SET 
		"nama" = $1, "email" = $2, "tgl_lahir" = $3,
		"no_telp" = $4, "alamat" = $5 WHERE ktp = $6`,
		[ person.nama, person.email, person.tanggal, person.telepon, person.alamat, id ],
		(error) => {
			if (checkerror(error, res)) return
			res.status(200).json({
				message: 'Update Data Success'
			})
		}
	)
})

router.delete('/:personId', (req, res, next) => {
	const id = req.params.personId
	pool.query('DELETE FROM person WHERE ktp = $1', [ id ], (error) => {
		if (checkerror(error, res)) return
		res.status(200).json({
			message: 'Hapus Data Success'
		})
	})
})

router.post('/:login', (req, res, next) => {
	const login = {
		ktp: req.body.ktp,
		email: req.body.email
	}

	if (login.ktp === config.ADMIN_KTP && login.email === config.ADMIN_EMAIL) {
		const person = {
			ktp: config.ADMIN_KTP,
			email: config.ADMIN_EMAIL,
			role: config.ADMIN_ROLE,
			nama: config.ADMIN_NAMA
		}
		res.status(200).json(person)
	} else {
		pool.query(
			'SELECT * FROM person WHERE ktp = $1 AND email = $2',
			[ login.ktp, login.email ],
			(error, results) => {
				if (checkerror(error, res)) return
				pool.query('SELECT * FROM anggota WHERE ktp = $1', [ login.ktp ], (err, ress) => {
					checkerror(err, ress)
					console.log(ress.rows[0].no_kartu)
					const person = {
						ktp: results.rows[0].ktp,
						email: results.rows[0].email,
						role: ress.rows.length !== 0
							? config.ANGGOTA_ROLE
							: config.PETUGAS_ROLE,
						nama: results.rows[0].nama,
						no_kartu: ress.rows.length !== 0
							? ress.rows[0].no_kartu
							: '0'
					}
					res.status(200).json(person)
				})
			}
		)
	}
})

router.post('/:topup', (req, res, next) => {
	const login = {
		ktp: req.body.ktp,
		saldo: req.body.saldo
	}
	pool.query('CALL public.topupsaldo($1, $2)', [ login.ktp, login.saldo ], (error, results) => {
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
