const express = require('express')
const router = express.Router()
const pool = require('../../config/db')
const config = require('dotenv').config().parsed

router.get('/', (req, res, next) => {
	pool.query(`SELECT 
					pm.nomor_sepeda as nomor,
					sp.merk as merk,
					pm.tgl_pinjam as pinjam,
					pm.tgl_kembali as kembali,
                    st.nama as stasiun,
                    st.id_stasiun as id_stasiun,
					pm.biaya as biaya,
					pm.denda as denda,
					pe.nama as peminjam,
					pm.no_kartu_anggota as no_kartu
				FROM peminjaman as pm
				JOIN stasiun as st
				ON st.id_stasiun = pm.id_stasiun
				JOIN sepeda as sp
				ON sp.nomor = pm.nomor_sepeda
				JOIN anggota as an
				ON an.no_kartu = pm.no_kartu_anggota
				JOIN person as pe
				ON pe.ktp = an.ktp`, (error, results) => {
					if (checkerror(error, res)) return	
					res.status(200).json(results.rows)
	})
})

router.get('/:spupdatedenda', (req, res) => {
	pool.query(
		`CALL public.updatedenda()`,
		(error, results) => {
			if (checkerror(error, res)) return
			res.status(200).json(results.rows)
		}
	)
})

router.patch('/:sepedaId', (req, res) => {
    console.log("in 1")
	const pinjam = {
		no_kartu: req.body.no_kartu,
		id_sepeda: req.params.sepedaId,
		id_stasiun: req.body.id_stasiun,
		tgl_pinjam: req.body.tgl_pinjam
	}
	pool.connect((error, client, done) => {
		client.query('BEGIN')
		if (checkerror(error, res, client, done)) return

		client.query('UPDATE sepeda SET status = true WHERE nomor = $1', [ pinjam.id_sepeda ], (err) => {
			if (checkerror(err, res, client, done)) return

			client.query(
				`UPDATE peminjaman SET tgl_kembali = $1 WHERE no_kartu_anggota = $2 AND nomor_sepeda = $3 AND tgl_pinjam = $4`,
				[ new Date(), pinjam.no_kartu, pinjam.id_sepeda, pinjam.tgl_pinjam ],
				(e) => {
					if (checkerror(e, res, client, done)) return
					client.query(
						`CALL public.updatedenda()`,
						(err) => {
							if (checkerror(err, res, client, done)) return
							client.query(
								`CALL public.insertpeminjaman($1, $2, $3, $4, $5, $6)`,
								[ pinjam.no_kartu, new Date(), pinjam.no_kartu, pinjam.tgl_pinjam, pinjam.id_sepeda, pinjam.id_stasiun ],
								(er) => {
									if (checkerror(er, res, client, done)) return

									client.query('COMMIT', (errorm) => {
										if (checkerror(errorm, res, client, done)) return
										res.status(200).json({
											message: 'Edit Data Success'
										})
										done()
									})
								}
							)
						}
					)
				}
			)
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
