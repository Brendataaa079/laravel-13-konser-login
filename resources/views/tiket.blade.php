<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SimTiket NEXZ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('css/style.css') }}">
</head>
<body>
<header class="atas">
  <div><span class="merek">SimTiket</span><span class="cap">SIMULASI</span></div>
  <div id="info-user" class="info-user" hidden>
    <span>Halo, <b id="nama-user"></b></span>
    <button id="tombol-keluar" type="button">Keluar</button>
  </div>
</header>

<nav id="stepper" class="stepper" aria-label="Langkah pembelian" hidden>
  <ol>
    <li data-n="1"><span>1</span>Pilih Tiket</li>
    <li data-n="2"><span>2</span>Detail Pesanan</li>
    <li data-n="3"><span>3</span>Pembayaran</li>
  </ol>
</nav>

<main class="halaman">

  <!-- ===== LAYAR 1: LOGIN / DAFTAR (dengan foto header) ===== -->
  <section id="layar-auth" class="masuk-bungkus">
    <div class="kotak-login">
      <img src="{{ asset('img/foto-header.jpg') }}" alt="Foto grup untuk header halaman login">
      <div class="isi">
        <div>
          <h1>Masuk dulu</h1>
          <p class="redup">Halaman latihan. Data konser di sini karangan, bukan info resmi.</p>
        </div>
        <div class="tab">
          <button id="tab-masuk" class="aktif" type="button">Masuk</button>
          <button id="tab-daftar" type="button">Daftar</button>
        </div>
        <form id="form-auth" novalidate>
          <label for="username">Username
            <input id="username" autocomplete="username" placeholder="contoh: fan_nexz">
          </label>
          <label for="password">Password
            <input id="password" type="password" autocomplete="current-password" placeholder="minimal 6 karakter">
          </label>
          <button id="tombol-auth" class="utama" type="submit">Masuk</button>
          <p id="pesan-auth" class="pesan" role="status" aria-live="polite"></p>
        </form>
      </div>
    </div>
  </section>

  <!-- ===== LAYAR 2: PILIH TIKET ===== -->
  <section id="layar-pilih" hidden class="dua-kolom">
    <div class="kolom">
      <div class="kartu event">
        <p class="label">Konser contoh</p>
        <h1>NEXZ Latihan Tour · Surabaya</h1>
        <p class="kode">Sabtu, 12 Desember 2026 · 18.00–22.00 · Gedung Contoh Arena</p>
      </div>
      <div id="daftar-kategori" class="kolom"></div>
      <p id="pesan-pilih" class="pesan" role="status" aria-live="polite"></p>
    </div>
    <aside class="samping kartu lembut">
      <h2>Rincian Pesanan</h2>
      <div class="ringkasan-isi"></div>
      <button id="tombol-lanjut-pilih" class="utama" type="button" disabled>Lanjutkan</button>
    </aside>
  </section>

  <!-- ===== LAYAR 3: DETAIL PESANAN ===== -->
  <section id="layar-detail" hidden class="dua-kolom">
    <div class="kolom">
      <div class="kartu">
        <h2>Data Pemesan</h2>
        <p class="redup" style="margin-block:4px 14px">Isi data contoh saja, jangan data pribadi asli. Data ini tidak disimpan dan hilang saat halaman dimuat ulang.</p>
        <div class="form">
          <label for="nama-pemesan">Nama lengkap
            <input id="nama-pemesan" autocomplete="off" placeholder="Nama contoh">
          </label>
          <div class="dua-isi">
            <label for="tipe-id">Tipe identitas
              <select id="tipe-id">
                <option value="">Pilih</option>
                <option>KTP</option>
                <option>SIM</option>
                <option>Paspor</option>
              </select>
            </label>
            <label for="noid-pemesan">Nomor identitas
              <input id="noid-pemesan" inputmode="numeric" autocomplete="off" placeholder="Angka contoh">
            </label>
          </div>
          <label for="email">Email
            <input id="email" type="email" autocomplete="off" placeholder="nama@contoh.com">
          </label>
          <label for="wa">No. WhatsApp
            <div class="wa"><span>+62</span><input id="wa" inputmode="numeric" autocomplete="off" placeholder="81234567890"></div>
          </label>
        </div>
      </div>
      <div id="form-tiket" class="kolom"></div>
      <p id="pesan-detail" class="pesan" role="status" aria-live="polite"></p>
    </div>
    <aside class="samping">
      <div class="timer"><span class="angka-timer">10:00</span>Batas waktu tersisa</div>
      <div class="kartu lembut" style="display:grid;gap:12px">
        <h2>Rincian Pesanan</h2>
        <div class="ringkasan-isi"></div>
        <div class="tombol-baris">
          <button id="tombol-kembali-detail" type="button" aria-label="Kembali ke pilih tiket">←</button>
          <button id="tombol-lanjut-detail" class="utama" type="button">Lanjutkan</button>
        </div>
      </div>
    </aside>
  </section>

  <!-- ===== LAYAR 4: PEMBAYARAN (berhenti di sini) ===== -->
  <section id="layar-bayar" hidden class="dua-kolom">
    <div class="kolom">
      <div class="kartu" style="display:grid;gap:12px">
        <h2>Metode Pembayaran</h2>
        <p class="redup">Semua metode di bawah hanya contoh. Tidak ada pembayaran sungguhan dan jangan isi nomor kartu atau rekening asli.</p>
        <label class="metode"><input type="radio" name="metode" value="Virtual Account (contoh)" checked> Virtual Account (contoh)</label>
        <label class="metode"><input type="radio" name="metode" value="Dompet digital (contoh)"> Dompet digital (contoh)</label>
        <label class="metode"><input type="radio" name="metode" value="Gerai minimarket (contoh)"> Gerai minimarket (contoh)</label>
      </div>
      <div id="kotak-menunggu" class="kartu" hidden style="display:grid;gap:8px">
        <p class="label">Menunggu pembayaran</p>
        <p>Metode: <b id="metode-dipilih"></b></p>
        <p class="redup">Kode bayar contoh</p>
        <p id="kode-bayar" class="kode-bayar"></p>
        <p class="redup">Alur simulasi berhenti di tahap ini. Konfirmasi pembayaran dan e-tiket belum dibuat.</p>
        <div><button id="tombol-ulang" type="button">Mulai lagi dari awal</button></div>
      </div>
    </div>
    <aside class="samping">
      <div class="timer"><span class="angka-timer">10:00</span>Batas waktu tersisa</div>
      <div class="kartu lembut" style="display:grid;gap:12px">
        <h2>Total Bayar</h2>
        <div class="ringkasan-isi"></div>
        <div class="tombol-baris">
          <button id="tombol-kembali-bayar" type="button" aria-label="Kembali ke detail pesanan">←</button>
          <button id="tombol-bayar" class="utama" type="button">Bayar sekarang</button>
        </div>
      </div>
    </aside>
  </section>
</main>

<script src="{{ asset('js/tiket.js') }}"></script>
</body>
</html>