CREATE OR REPLACE PROCEDURE public.updatedenda()
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
	WITH temp AS (
			SELECT *, DATE_PART('day', tgl_kembali - tgl_pinjam)
				* 24 + DATE_PART('hour', tgl_kembali - tgl_pinjam) as totalhours
			FROM peminjaman
	), data AS (
			SELECT *,
				CASE
					WHEN totalhours > 24
						THEN 3000000
					ELSE totalhours * 50000
				END AS totaldenda
			FROM temp WHERE totalhours > 10
	)
	UPDATE peminjaman 
		SET denda = (SELECT totaldenda FROM data)
		WHERE no_kartu_anggota 
			IN (SELECT no_kartu_anggota FROM data);
END;
$BODY$;

CREATE OR REPLACE PROCEDURE public.insertlaporan()
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
	WITH temp AS (
			SELECT *, DATE_PART('day', tgl_kembali - tgl_pinjam)
				* 24 + DATE_PART('hour', tgl_kembali - tgl_pinjam) as totalhours
			FROM peminjaman
	), data AS (
			SELECT ROW_NUMBER () OVER (ORDER BY no_kartu_anggota) ,
			no_kartu_anggota,
			tgl_pinjam, nomor_sepeda,
			id_stasiun, 
			'Progress' as status
			FROM temp WHERE totalhours > 24
	)
INSERT INTO laporan
SELECT * FROM data;
END;
$BODY$;

CREATE OR REPLACE PROCEDURE public.topupsaldo(
	ktp_anggota character varying,
	saldo_anggota double precision)
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
	UPDATE anggota SET "saldo" = saldo_anggota WHERE "ktp" = ktp_anggota;
END;
$BODY$;

CREATE FUNCTION public.updatepointpinjam()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF 
AS $BODY$
BEGIN
   IF DATE_PART('day', NEW.tgl_kembali - NEW.tgl_pinjam) 
   		* 24 + DATE_PART('hour', NEW.tgl_kembali - NEW.tgl_pinjam) < 10
   THEN
       UPDATE anggota set point = ((
		   select point from anggota
		   where no_kartu = OLD.no_kartu_anggota
	   ) + 1000) where ktp = OLD.no_kartu_anggota;
   END IF;
   RETURN NEW;
END;
$BODY$;

CREATE TRIGGER updatepointpinjam
    AFTER UPDATE
    ON public.peminjaman
    FOR EACH ROW
    EXECUTE PROCEDURE public.updatepointpinjam();
	
CREATE FUNCTION public.updatepointvoucher()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF 
AS $BODY$
BEGIN
       UPDATE anggota set point = ((
		   select point from anggota
		   where no_kartu = NEW.no_kartu_anggota
	   ) - 1000) where ktp = NEW.no_kartu_anggota;
END;
$BODY$;

CREATE TRIGGER updatepointvoucher
    AFTER UPDATE
    ON public.anggota_voucher
    FOR EACH ROW
    EXECUTE PROCEDURE public.updatepointvoucher();

CREATE OR REPLACE PROCEDURE public.insertpeminjaman(
	no_kartu character varying,
	tgl_trans date,
	no_kartu_pinjam character varying,
	tgl_pin date,
	no_spd character varying,
	id_sta character varying
)
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
	INSERT INTO transaksi_khusus_peminjaman
	VALUES(
		no_kartu,
		tgl_trans,
		no_kartu_pinjam,
		tgl_pin,
		no_spd,
		id_sta
	);
END;
$BODY$;

CREATE FUNCTION public.updatejumlahvoucher()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF 
AS $BODY$
BEGIN
       UPDATE voucher set jumlah = ((
		   select jumlah from voucher
		   where id_voucher = NEW.id_voucher
	   ) - 1) where id_voucher = NEW.id_voucher;
END;
$BODY$;

CREATE TRIGGER updatejumlahvoucher
    AFTER INSERT
    ON public.anggota_voucher
    FOR EACH ROW
    EXECUTE PROCEDURE public.updatejumlahvoucher();


CREATE FUNCTION public.transaksitopup()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF 
AS $BODY$
BEGIN
	IF NEW.saldo > OLD.saldo
	THEN
       INSERT INTO public.transaksi
	   VALUES(NEW.no_kartu, now(), 'Topup', NEW.saldo - OLD.saldo);
	END IF;
	RETURN NEW;
END;
$BODY$;

CREATE TRIGGER inserttopup
    AFTER UPDATE
    ON public.anggota
    FOR EACH ROW
    EXECUTE PROCEDURE public.transaksitopup();

CREATE FUNCTION public.transaksipeminjaman()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF 
AS $BODY$
BEGIN
       INSERT INTO public.transaksi
	   VALUES(NEW.no_kartu_anggota, now(), 'Peminjaman', NEW.biaya);
RETURN NEW;
END;
$BODY$;

CREATE TRIGGER inserttopup
    AFTER INSERT
    ON public.peminjaman
    FOR EACH ROW
    EXECUTE PROCEDURE public.transaksipeminjaman();