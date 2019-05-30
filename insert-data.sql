INSERT INTO public.person(
	ktp, email, nama, alamat, tgl_lahir, no_telp)
	VALUES ('112345', 'person1@mail.com', 'Person 1', 'Indonesia', '1990-09-09', '012345678');
INSERT INTO public.person(
	ktp, email, nama, alamat, tgl_lahir, no_telp)
	VALUES ('212345', 'person2@mail.com', 'Person 2', 'Indonesia', '1990-09-09', '012345678');
INSERT INTO public.person(
	ktp, email, nama, alamat, tgl_lahir, no_telp)
	VALUES ('312345', 'person3@mail.com', 'Person 3', 'Indonesia', '1990-09-09', '012345678');
INSERT INTO public.person(
	ktp, email, nama, alamat, tgl_lahir, no_telp)
	VALUES ('412345', 'person4@mail.com', 'Person 4', 'Indonesia', '1990-09-09', '012345678');
INSERT INTO public.person(
	ktp, email, nama, alamat, tgl_lahir, no_telp)
	VALUES ('512345', 'person5@mail.com', 'Person 5', 'Indonesia', '1990-09-09', '012345678');
INSERT INTO public.person(
	ktp, email, nama, alamat, tgl_lahir, no_telp)
	VALUES ('612345', 'person6@mail.com', 'Person 6', 'Indonesia', '1990-09-09', '012345678');

INSERT INTO public.petugas(ktp, gaji)VALUES ('112345', 30000);
INSERT INTO public.petugas(ktp, gaji)VALUES ('212345', 30000);
INSERT INTO public.petugas(ktp, gaji)VALUES ('312345', 30000);

INSERT INTO public.anggota(no_kartu, saldo, point, ktp)
	VALUES ('A412345', 0, 0, '412345');
INSERT INTO public.anggota(no_kartu, saldo, point, ktp)
	VALUES ('A512345', 0, 0, '512345');
INSERT INTO public.anggota(no_kartu, saldo, point, ktp)
	VALUES ('A612345', 0, 0, '612345');

INSERT INTO public.stasiun(
	id_stasiun, alamat, latitude, longitude, nama)
	VALUES ('ST1', 'Jakarta', 112345, 112345, 'Stasiun 1');
INSERT INTO public.stasiun(
	id_stasiun, alamat, latitude, longitude, nama)
	VALUES ('ST2', 'Jakarta', 212345, 212345, 'Stasiun 2');
INSERT INTO public.stasiun(
	id_stasiun, alamat, latitude, longitude, nama)
	VALUES ('ST3', 'Jakarta', 312345, 312345, 'Stasiun 3');
INSERT INTO public.stasiun(
	id_stasiun, alamat, latitude, longitude, nama)
	VALUES ('ST4', 'Jakarta', 412345, 412345, 'Stasiun 4');
INSERT INTO public.stasiun(
	id_stasiun, alamat, latitude, longitude, nama)
	VALUES ('ST5', 'Jakarta', 512345, 512345, 'Stasiun 5');

INSERT INTO public.sepeda(
	nomor, merk, jenis, status, id_stasiun, no_kartu_penyumbang)
	VALUES ('SP1', 'Polygon', 'MTB', true, 'ST1', 'A412345');
INSERT INTO public.sepeda(
	nomor, merk, jenis, status, id_stasiun, no_kartu_penyumbang)
	VALUES ('SP2', 'United', 'MTB', true, 'ST2', 'A412345');
INSERT INTO public.sepeda(
	nomor, merk, jenis, status, id_stasiun, no_kartu_penyumbang)
	VALUES ('SP3', 'Wimcycle', 'MTB', true, 'ST3', 'A512345');
INSERT INTO public.sepeda(
	nomor, merk, jenis, status, id_stasiun, no_kartu_penyumbang)
	VALUES ('SP4', 'Police', 'MTB', true, 'ST4', 'A612345');
INSERT INTO public.sepeda(
	nomor, merk, jenis, status, id_stasiun, no_kartu_penyumbang)
	VALUES ('SP5', 'Polygon', 'MTB', true, 'ST5', 'A612345');

INSERT INTO public.voucher(
	id_voucher, nama, kategori, nilai, jumlah, deskripsi)
	VALUES ('V1', 'Voucher 1', 'Belanja', 10000, 20, '-');
INSERT INTO public.voucher(
	id_voucher, nama, kategori, nilai, jumlah, deskripsi)
	VALUES ('V2', 'Voucher 2', 'Diskon', 20000, 25, '-');
INSERT INTO public.voucher(
	id_voucher, nama, kategori, nilai, jumlah, deskripsi)
	VALUES ('V3', 'Voucher 3', 'Cash Back', 5000, 10, '-');
INSERT INTO public.voucher(
	id_voucher, nama, kategori, nilai, jumlah, deskripsi)
	VALUES ('V4', 'Voucher 4', 'Belanja', 15000, 5, '-');
