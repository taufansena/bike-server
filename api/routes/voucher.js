const express = require('express')
const router = express.Router()
const pool = require('../../config/db')

router.get('/', (req, res) => {
	pool.query('SELECT * FROM voucher', (error, results) => {
		checkerror(error, res)
		res.status(200).json(results.rows)
	})
})

router.get('/:voucherId', (req, res) => {
	const id = req.params.voucherId
	pool.query('SELECT * FROM voucher WHERE id_voucher = $1', [ id ], (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json(results.rows)
	})
})

router.post('/', (req, res) => {
	const voucher = {
		id_voucher: req.body.id,
		nama: req.body.nama,
		kategori: req.body.kategori,
		nilai: req.body.nilai,
		jumlah: req.body.jumlah,
		deskripsi: req.body.deskripsi
	}
	pool.connect((error, client, done) => {
		client.query('BEGIN')
		if (checkerror(error, res)) return

		client.query(
			`INSERT INTO voucher 
			("id_voucher", "nama", "kategori", "nilai", "jumlah", "deskripsi") 
			VALUES ($1, $2, $3, $4, $5, $6)`,
			[ 'V' + voucher.id_voucher, voucher.nama, voucher.kategori, voucher.nilai, voucher.jumlah, voucher.deskripsi ],
			(err) => {
				checkerror(err, res, client, done)

				client.query('COMMIT', (err) => {
					if (checkerror(err, res)) return
					res.status(200).json({
						message: 'Insert Data Success'
					})
					done()
				})
			}
		)
	})
})

router.patch('/:voucherId', (req, res) => {
	const id = req.params.voucherId
	const voucher = {
		nama: req.body.nama,
		kategori: req.body.kategori,
		nilai: req.body.nilai,
		jumlah: req.body.jumlah,
		deskripsi: req.body.deskripsi
	}
	pool.query(
		`UPDATE voucher SET 
		"nama" = $1, "kategori" = $2, "nilai" = $3,
		"jumlah" = $4, "deskripsi" = $5 WHERE id_voucher = $6`,
		[ voucher.nama, voucher.kategori, voucher.nilai, voucher.jumlah, voucher.deskripsi, id ],
		(error) => {
			if (checkerror(error, res)) return
			res.status(200).json({
				message: 'Update Data Success'
			})
		}
	)
})

router.delete('/:voucherId', (req, res) => {
	const id = req.params.voucherId
	pool.query('DELETE FROM voucher WHERE id_voucher = $1', [ id ], (error, results) => {
		if (checkerror(error, res)) return
		res.status(200).json({
			message: 'Hapus Data Success'
		})
	})
})

router.post('/:klaim', (req, res) => {
	const voucher = {
		no_kartu_anggota: req.body.no_kartu_anggota,
		id_voucher: req.body.id_voucher
	}
	pool.query(`INSERT INTO anggota_voucher 
		("id_voucher", "no_kartu_anggota") 
		VALUES ($1, $2)`,
		[ voucher.id_voucher, voucher.no_kartu_anggota ], (error, results) => {
			if (checkerror(error, res)) return
		res.status(200).json({
			message: 'Edit Data Success'
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
