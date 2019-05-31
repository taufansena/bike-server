CREATE TABLE ACARA (
  id_acara VARCHAR(100),
  judul VARCHAR(100) NOT NULL,
  deskripsi text,
  tgl_mulai DATE NOT NULL,
  tgl_selesai DATE NOT NULL,
  gratis boolean NOT NULL,

  PRIMARY KEY (id_acara)
);

CREATE TABLE STASIUN (
    id_stasiun VARCHAR(100),
    alamat text not null,
    latitude real,
    longitude real,
    nama varchar(50) not null,

    PRIMARY KEY(id_stasiun)
);

CREATE TABLE ACARA_STASIUN(
    id_stasiun varchar(100) not null REFERENCES STASIUN(id_stasiun),
    id_acara varchar(100) not null REFERENCES ACARA(id_acara),

    PRIMARY KEY (id_stasiun,id_acara)
);

CREATE TABLE PERSON (
    ktp varchar(20),
    email varchar(50) NOT NULL,
    nama varchar(50) NOT NULL,
    alamat text,
    tgl_lahir date not null,
    no_telp varchar(20),
    
    PRIMARY KEY(ktp),
    UNIQUE(email)
);

CREATE TABLE ANGGOTA(
    no_kartu varchar(100),
    saldo real,
    point integer,
    ktp varchar(20) not null REFERENCES person(ktp),

    PRIMARY KEY(no_kartu) 
);

CREATE TABLE SEPEDA(
    nomor VARCHAR(100),
    merk VARCHAR(100) not null,
    jenis VARCHAR(50) not null,
    status boolean not null,
    id_stasiun varchar(100) not null REFERENCES STASIUN(id_stasiun),
    no_kartu_penyumbang VARCHAR(20) not null REFERENCES ANGGOTA(no_kartu),

    PRIMARY KEY(nomor)
);

CREATE Table PETUGAS(
    ktp varchar(20) not null REFERENCES PERSON,
    gaji real not null,

    PRIMARY KEY(ktp)
);

CREATE Table PENUGASAN (
    ktp varchar(20),
    tgl_mulai TIMESTAMP,
    tgl_selesai TIMESTAMP,
    id_stasiun varchar(100),

    PRIMARY KEY (ktp,tgl_mulai,id_stasiun)
);

CREATE TABLE PEMINJAMAN(
    no_kartu_anggota VARCHAR(100) not null REFERENCES ANGGOTA(no_kartu),
    tgl_pinjam TIMESTAMP,
    nomor_sepeda VARCHAR(100) not null REFERENCES SEPEDA(nomor),
    id_stasiun VARCHAR(100) not null REFERENCES STASIUN(id_stasiun),
    tgl_kembali TIMESTAMP,
    biaya real,
    denda real,

    PRIMARY KEY (no_kartu_anggota,tgl_pinjam,nomor_sepeda,id_stasiun)
);

CREATE TABLE LAPORAN (
    id_laporan VARCHAR(100),
    no_kartu_anggota VARCHAR(100) not null,
    tgl_pinjam TIMESTAMP not null,
    nomor_sepeda VARCHAR(100) not null,
    id_stasiun VARCHAR(100) not null,
    status VARCHAR(20) NOT NULL,

    PRIMARY KEY (id_laporan,no_kartu_anggota,tgl_pinjam,nomor_sepeda,id_stasiun),
    FOREIGN KEY (tgl_pinjam, id_stasiun, no_kartu_anggota, nomor_sepeda)
    REFERENCES peminjaman (tgl_pinjam, id_stasiun, no_kartu_anggota, nomor_sepeda)

);

CREATE TABLE TRANSAKSI (
    no_kartu_anggota VARCHAR(100) not null REFERENCES ANGGOTA(no_kartu),
    tgl_transaksi TIMESTAMP,
    jenis VARCHAR(20) not null,
    nominal real not null,

    PRIMARY KEY(no_kartu_anggota,tgl_transaksi)
);

CREATE TABLE TRANSAKSI_KHUSUS_PEMINJAMAN (
    no_kartu_anggota VARCHAR(100),
    tgl_transaksi TIMESTAMP,
    no_kartu_peminjam VARCHAR(100) not null,
    tgl_pinjam TIMESTAMP not null,
    no_sepeda VARCHAR(100) not null,
    id_stasiun VARCHAR(100) not null,

    PRIMARY KEY(no_kartu_anggota,tgl_transaksi),
CONSTRAINT transaksi_khusus_peminjaman_no_kartu_anggota_fkey FOREIGN KEY (tgl_transaksi, no_kartu_anggota)
        REFERENCES public.transaksi (tgl_transaksi, no_kartu_anggota),
CONSTRAINT transaksi_khusus_peminjaman_no_kartu_peminjam_fkey FOREIGN KEY (tgl_pinjam, no_sepeda, no_kartu_peminjam, id_stasiun)
        REFERENCES public.peminjaman (tgl_pinjam, nomor_sepeda, no_kartu_anggota, id_stasiun)

);

CREATE TABLE VOUCHER (
    id_voucher VARCHAR(100),
    nama varchar(255) not null,
    kategori VARCHAR(255) not null,
    nilai real not null,
    jumlah real not null,
    deskripsi text,

    PRIMARY KEY(id_voucher)
);

CREATE TABLE ANGGOTA_VOUCHER(
    no_kartu_anggota varchar(100) not null REFERENCES ANGGOTA(no_kartu),
    id_voucher varchar(100) not null REFERENCES VOUCHER(id_voucher),
    id_voucher_anggota integer NOT NULL DEFAULT nextval('anggota_voucher_id_voucher_anggota_seq'::regclass) ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),

    PRIMARY KEY (id_voucher_anggota)
);