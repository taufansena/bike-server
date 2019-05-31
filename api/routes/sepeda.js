const express = require('express')
const router = express.Router()
const pool = require('../../config/db')

router.get('/', (req, res) => {
	pool.query(
		`SELECT 
			sp.nomor as id,  
			sp.merk as merk,
			sp.jenis as jenis,
			sp.status as status,
			st.nama as stasiun,
			st.id_stasiun as id_stasiun,
			pe.nama as penyumbang,
			an.no_kartu
		FROM sepeda as sp
		JOIN stasiun as st
		ON st.id_stasiun = sp.id_stasiun
		JOIN anggota as an
		ON sp.no_kartu_penyumbang = an.no_kartu
		JOIN person as pe
		ON pe.ktp = an.ktp`,
		(error, results) => {
			if (checkerror(error, res)) return
			res.status(200).json(results.rows)
		}
	)
})

router.get('/:sepedaId', (req, res) => {
	const id = req.params.sepedaId
	pool.query('SELECT * FROM sepeda WHERE nomor = $1', [ id ], (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json(results.rows)
	})
})

router.post('/', (req, res) => {
	const sepeda = {
		nomor: req.body.nomor,
		merk: req.body.merk,
		jenis: req.body.jenis,
		status: req.body.status,
		stasiun: req.body.stasiun,
		penyumbang: req.body.penyumbang
	}
	pool.connect((error, client, done) => {
		client.query('BEGIN')
		if (checkerror(error, res, client, done)) return
			client.query(
				`INSERT INTO sepeda 
				("nomor", "merk", "jenis", "status", "id_stasiun", "no_kartu_penyumbang") 
				VALUES ($1, $2, $3, $4, $5, $6)`,
				[ 'SP' + sepeda.nomor, sepeda.merk, sepeda.jenis, sepeda.status, sepeda.stasiun, sepeda.penyumbang ],
				(err, results) => {
					if (checkerror(err, res, client, done)) return
				}
			)

		client.query('COMMIT', (error) => {
			if (checkerror(error, res, client, done)) return
			res.status(200).json({
				message: 'Insert Data Success'
			})
			done()
		})
	})
})

router.patch('/:sepedaId', (req, res) => {
	const id = req.params.sepedaId
	const sepeda = {
		merk: req.body.merk,
		jenis: req.body.jenis,
		status: req.body.status,
		stasiun: req.body.stasiun,
		penyumbang: req.body.penyumbang
	}
	pool.query(
		`UPDATE sepeda SET 
		"merk" = $1, "jenis" = $2, "status" = $3,
		"id_stasiun" = $4, "no_kartu_penyumbang" = $5 WHERE nomor = $6`,
		[ sepeda.merk, sepeda.jenis, sepeda.status, sepeda.stasiun, sepeda.penyumbang, id ],
		(error) => {
			if (checkerror(error, res)) return
			res.status(200).json({
				message: 'Update Data Success'
			})
		}
	)
})

router.delete('/:sepedaId', (req, res) => {
	const id = req.params.sepedaId
	pool.query('DELETE FROM sepeda WHERE nomor = $1', [ id ], (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json({
			message: 'Hapus Data Success'
		})
	})
})

router.post('/:pinjam', (req, res) => {
	const pinjam = {
		no_kartu: req.body.no_kartu,
		id_sepeda: req.body.id_sepeda,
		id_stasiun: req.body.id_stasiun
	}
	pool.connect((error, client, done) => {
		client.query('BEGIN')
		if (checkerror(error, res, client, done)) return

		client.query('UPDATE sepeda SET status = false WHERE nomor = $1', [ pinjam.id_sepeda ], (err) => {
			if (checkerror(err, res, client, done)) return

			client.query(
				`INSERT INTO peminjaman ("no_kartu_anggota", "tgl_pinjam", "nomor_sepeda", "id_stasiun", "biaya")
					VALUES ($1, $2, $3, $4, $5)`, [pinjam.no_kartu, new Date(), pinjam.id_sepeda, pinjam.id_stasiun, 25000],
				(e) => {
					if (checkerror(e, res, client, done)) return
					
					client.query('COMMIT', (errorm) => {
						if (checkerror(errorm, res)) return
						res.status(200).json({
							message: 'Edit Data Success'
						})
						done()
					})
				}
			)
		})
	})
})

router.get('/:peminjaman', (req, res, next) => {
	pool.query(`SELECT 
					pm.nomor_sepeda as nomor,
					sp.merk as merk,
					pm.tgl_pinjam as pinjam,
					pm.tgl_kembali as kembali,
					st.nama as stasiun,
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

router.get('/:spinsertlaporan', (req, res) => {
	pool.query(
		`CALL public.insertlaporan()`,
		(error, results) => {
			if (checkerror(error, res)) return
			res.status(200).json(results.rows)
		}
	)
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
