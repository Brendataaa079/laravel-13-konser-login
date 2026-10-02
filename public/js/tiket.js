/* =========================================================
   BAGIAN 1: DATA & STATUS
   ========================================================= */
const KUNCI = "simtiket-akun";   // tempat simpan akun di browser
const BIAYA_LAYANAN = 5000;      // per tiket
const DURASI = 600;              // 10 menit, dalam detik

const KATEGORI = [
  { id: "reguler", nama: "Reguler (Ticket Only)",            ket: "Tiket masuk saja.",                    harga: 275000, stok: 50, bundle: false },
  { id: "bundle",  nama: "Reguler Bundle (Kaos + Tiket)",    ket: "Tiket masuk plus kaos, pilih ukuran.", harga: 525000, stok: 20, bundle: true  },
  { id: "vip",     nama: "VIP (Tribun Depan)",               ket: "Tiket masuk, area tribun depan.",      harga: 950000, stok: 10, bundle: false }
];
const stok = {};
KATEGORI.forEach(k => stok[k.id] = k.stok);

let daftarUser = muatData();
let userAktif = null;
let modeDaftar = false;
let pilihan = null;      // { id, jumlah } tiket yang sedang dipilih
let reservasi = false;   // true = stok sedang "ditahan" selama isi data
let sudahBayar = false;
let sisaDetik = 0;
let timer = null;

const $ = id => document.getElementById(id);
const rupiah = n => "Rp " + n.toLocaleString("id-ID");

/* =========================================================
   BAGIAN 2: SIMPAN AKUN (try/catch karena bisa gagal)
   ========================================================= */
function muatData() {
  try { return JSON.parse(localStorage.getItem(KUNCI)) || []; }
  catch (e) { return []; }
}
function simpanData() {
  try { localStorage.setItem(KUNCI, JSON.stringify(daftarUser)); }
  catch (e) { /* kalau gagal, akun hanya hidup selama halaman terbuka */ }
}

/* =========================================================
   BAGIAN 3: LOGIN & DAFTAR
   ========================================================= */
// Hash mainan, khusus latihan. Aplikasi asli: Hash::make() di Laravel.
function hashSederhana(teks) {
  let h = 0;
  for (const huruf of teks) h = (h * 31 + huruf.charCodeAt(0)) | 0;
  return h.toString(16);
}

function daftar(username, password) {
  if (username.length < 3) return "Username minimal 3 karakter.";
  if (password.length < 6) return "Password minimal 6 karakter.";
  if (daftarUser.some(u => u.username.toLowerCase() === username.toLowerCase())) return "Username itu sudah dipakai.";
  const akun = { username, hash: hashSederhana(password) };
  daftarUser.push(akun);
  simpanData();
  userAktif = akun;
  return null;
}

function masuk(username, password) {
  const akun = daftarUser.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!akun || akun.hash !== hashSederhana(password)) return "Username atau password salah.";
  userAktif = akun;
  return null;
}

function keluar() {
  hentikanTimer();
  lepasStok();
  pilihan = null;
  userAktif = null;
  perbaruiKategori();
  isiRingkasan();
  tampil("auth");
}

/* =========================================================
   BAGIAN 4: PINDAH LAYAR
   ========================================================= */
const LAYAR = ["auth", "pilih", "detail", "bayar"];

function tampil(nama) {
  LAYAR.forEach(l => $("layar-" + l).hidden = (l !== nama));
  $("stepper").hidden = (nama === "auth");
  $("info-user").hidden = (nama === "auth");
  if (userAktif) $("nama-user").textContent = userAktif.username;
  const nomor = { pilih: 1, detail: 2, bayar: 3 }[nama];
  document.querySelectorAll("#stepper li").forEach(li => {
    li.classList.toggle("aktif", Number(li.dataset.n) === nomor);
  });
  window.scrollTo(0, 0);
}

function tulisPesan(id, teks, jenis) {
  const el = $(id);
  el.textContent = teks;              // textContent aman dari injeksi HTML
  el.className = "pesan " + (jenis || "");
}

/* =========================================================
   BAGIAN 5: PILIH TIKET
   ========================================================= */
function bangunKategori() {
  KATEGORI.forEach(k => {
    const el = document.createElement("article");
    el.className = "tiket";
    el.id = "kartu-" + k.id;
    el.innerHTML =
      '<div class="baris"><span class="pil">On Sale</span><span class="redup">Sisa <b id="sisa-' + k.id + '"></b></span></div>' +
      '<h3>' + k.nama + '</h3><p class="redup">' + k.ket + '</p><div class="garis-putus"></div>' +
      '<div class="baris"><span class="harga">' + rupiah(k.harga) + '</span><div class="aksi">' +
      '<select id="jumlah-' + k.id + '" aria-label="Jumlah tiket ' + k.nama + '"><option>1</option><option>2</option><option>3</option><option>4</option></select>' +
      '<button class="utama" type="button" data-id="' + k.id + '">Pilih</button></div></div>';
    $("daftar-kategori").appendChild(el);
  });
}

function perbaruiKategori() {
  KATEGORI.forEach(k => {
    $("sisa-" + k.id).textContent = stok[k.id];
    const dipilih = pilihan && pilihan.id === k.id;
    $("kartu-" + k.id).classList.toggle("dipilih", !!dipilih);
    const tombol = document.querySelector('button[data-id="' + k.id + '"]');
    tombol.disabled = stok[k.id] === 0;
    tombol.textContent = stok[k.id] === 0 ? "Habis" : (dipilih ? "Dipilih" : "Pilih");
  });
}

function pilih(id) {
  const jumlah = Number($("jumlah-" + id).value);
  if (jumlah > stok[id]) { tulisPesan("pesan-pilih", "Stok tinggal " + stok[id] + ".", "salah"); return; }
  pilihan = { id, jumlah };
  tulisPesan("pesan-pilih", "");
  perbaruiKategori();
  isiRingkasan();
}

function kategoriDipilih() {
  return pilihan ? KATEGORI.find(k => k.id === pilihan.id) : null;
}

function hitungTotal() {
  const k = kategoriDipilih();
  if (!k) return { sub: 0, layanan: 0, total: 0 };
  const sub = k.harga * pilihan.jumlah;
  const layanan = BIAYA_LAYANAN * pilihan.jumlah;
  return { sub, layanan, total: sub + layanan };
}

// Ringkasan muncul di tiga layar, jadi diisi ke semua elemen ber-class "ringkasan-isi".
function isiRingkasan() {
  const k = kategoriDipilih();
  const h = hitungTotal();
  document.querySelectorAll(".ringkasan-isi").forEach(el => {
    if (!k) { el.innerHTML = '<p class="redup">Belum ada tiket dipilih.</p>'; return; }
    el.innerHTML =
      '<p class="nama-item"></p><div class="baris"><span class="redup jml"></span><b class="hrg"></b></div><hr>' +
      '<div class="baris"><span class="redup">Biaya layanan</span><span class="lay"></span></div>' +
      '<div class="baris total"><span>Total</span><b class="tot"></b></div>';
    el.querySelector(".nama-item").textContent = k.nama;
    el.querySelector(".jml").textContent = "x" + pilihan.jumlah;
    el.querySelector(".hrg").textContent = rupiah(h.sub);
    el.querySelector(".lay").textContent = rupiah(h.layanan);
    el.querySelector(".tot").textContent = rupiah(h.total);
  });
  $("tombol-lanjut-pilih").disabled = !k;
}

/* =========================================================
   BAGIAN 6: STOK DITAHAN & TIMER
   ========================================================= */
function lepasStok() {
  if (reservasi && pilihan) { stok[pilihan.id] += pilihan.jumlah; }
  reservasi = false;
}

function mulaiTimer() {
  hentikanTimer();
  sisaDetik = DURASI;
  perbaruiTimer();
  timer = setInterval(() => {
    sisaDetik--;
    perbaruiTimer();
    if (sisaDetik <= 0) waktuHabis();
  }, 1000);
}

function hentikanTimer() {
  clearInterval(timer);
  timer = null;
}

function perbaruiTimer() {
  const menit = String(Math.floor(sisaDetik / 60)).padStart(2, "0");
  const detik = String(sisaDetik % 60).padStart(2, "0");
  document.querySelectorAll(".angka-timer").forEach(el => el.textContent = menit + ":" + detik);
}

function waktuHabis() {
  hentikanTimer();
  lepasStok();
  pilihan = null;
  perbaruiKategori();
  isiRingkasan();
  tampil("pilih");
  tulisPesan("pesan-pilih", "Waktu habis. Tiket dikembalikan, silakan pilih lagi.", "salah");
}

/* =========================================================
   BAGIAN 7: DETAIL PESANAN
   ========================================================= */
// Satu kotak isian per tiket yang dibeli.
function bangunFormTiket() {
  const k = kategoriDipilih();
  const wadah = $("form-tiket");
  wadah.innerHTML = "";
  for (let i = 1; i <= pilihan.jumlah; i++) {
    const kotak = document.createElement("fieldset");
    kotak.className = "kotak";
    let ukuran = "";
    if (k.bundle) {
      ukuran = '<div role="radiogroup" aria-label="Ukuran baju tiket ' + i + '"><span class="label">Ukuran baju</span><div class="chips" style="margin-top:6px">' +
        ["S", "M", "L", "XL", "XXL"].map(u =>
          '<label class="chip"><input type="radio" name="ukuran-' + i + '" value="' + u + '"><span>' + u + '</span></label>').join("") +
        '</div></div>';
    }
    kotak.innerHTML =
      '<legend>Tiket ' + i + '</legend><p class="redup nama-kat"></p>' +
      '<label class="sakelar"><input type="checkbox" id="sama-' + i + '"> Samakan dengan data pemesan</label>' +
      '<label for="nama-' + i + '">Nama lengkap<input id="nama-' + i + '" autocomplete="off"></label>' +
      '<label for="noid-' + i + '">Nomor identitas<input id="noid-' + i + '" inputmode="numeric" autocomplete="off"></label>' + ukuran;
    kotak.querySelector(".nama-kat").textContent = k.nama;
    wadah.appendChild(kotak);
  }
}

// Kembalikan pesan error pertama, atau null kalau semua isian benar.
function cekDetail() {
  const v = id => $(id).value.trim();
  if (v("nama-pemesan").length < 3) return "Nama pemesan minimal 3 huruf.";
  if (!v("tipe-id")) return "Pilih tipe identitas.";
  if (v("noid-pemesan").length < 8) return "Nomor identitas pemesan minimal 8 karakter.";
  if (!/^\S+@\S+\.\S+$/.test(v("email"))) return "Format email belum benar.";
  if (!/^[0-9]{9,13}$/.test(v("wa"))) return "No. WhatsApp 9 sampai 13 angka, tanpa +62.";
  for (let i = 1; i <= pilihan.jumlah; i++) {
    if (v("nama-" + i).length < 3) return "Nama di tiket " + i + " minimal 3 huruf.";
    if (v("noid-" + i).length < 8) return "Nomor identitas tiket " + i + " minimal 8 karakter.";
    if (kategoriDipilih().bundle && !document.querySelector('input[name="ukuran-' + i + '"]:checked')) {
      return "Pilih ukuran baju untuk tiket " + i + ".";
    }
  }
  return null;
}

function kosongkanForm() {
  ["nama-pemesan", "noid-pemesan", "email", "wa"].forEach(id => $(id).value = "");
  $("tipe-id").value = "";
  $("form-tiket").innerHTML = "";
  tulisPesan("pesan-detail", "");
}

/* =========================================================
   BAGIAN 8: MENYAMBUNGKAN TOMBOL
   ========================================================= */
$("tab-masuk").addEventListener("click", () => aturForm(false));
$("tab-daftar").addEventListener("click", () => aturForm(true));

function aturForm(daftarMode) {
  modeDaftar = daftarMode;
  $("tab-masuk").classList.toggle("aktif", !daftarMode);
  $("tab-daftar").classList.toggle("aktif", daftarMode);
  $("tombol-auth").textContent = daftarMode ? "Buat akun" : "Masuk";
  $("password").autocomplete = daftarMode ? "new-password" : "current-password";
  tulisPesan("pesan-auth", "");
}

$("form-auth").addEventListener("submit", e => {
  e.preventDefault();
  const username = $("username").value.trim();
  const password = $("password").value;
  const error = modeDaftar ? daftar(username, password) : masuk(username, password);
  if (error) { tulisPesan("pesan-auth", error, "salah"); return; }
  $("password").value = "";
  tulisPesan("pesan-auth", "");
  tulisPesan("pesan-pilih", "");
  tampil("pilih");
});

$("tombol-keluar").addEventListener("click", keluar);

$("daftar-kategori").addEventListener("click", e => {
  const tombol = e.target.closest("button[data-id]");
  if (tombol) pilih(tombol.dataset.id);
});
$("daftar-kategori").addEventListener("change", e => {
  if (pilihan && e.target.id === "jumlah-" + pilihan.id) pilih(pilihan.id);
});

// Pilih -> Detail: stok mulai "ditahan" dan timer jalan.
$("tombol-lanjut-pilih").addEventListener("click", () => {
  if (!pilihan) return;
  if (stok[pilihan.id] < pilihan.jumlah) { tulisPesan("pesan-pilih", "Stok sudah berubah, pilih lagi.", "salah"); return; }
  stok[pilihan.id] -= pilihan.jumlah;
  reservasi = true;
  perbaruiKategori();
  kosongkanForm();
  bangunFormTiket();
  mulaiTimer();
  tampil("detail");
});

// Isi otomatis tiket dari data pemesan.
$("form-tiket").addEventListener("change", e => {
  if (!e.target.id.startsWith("sama-")) return;
  const i = e.target.id.split("-")[1];
  const nama = $("nama-" + i), noid = $("noid-" + i);
  if (e.target.checked) { nama.value = $("nama-pemesan").value; noid.value = $("noid-pemesan").value; }
  nama.readOnly = noid.readOnly = e.target.checked;
});

$("tombol-kembali-detail").addEventListener("click", () => {
  hentikanTimer();
  lepasStok();
  perbaruiKategori();
  tampil("pilih");
});

$("tombol-lanjut-detail").addEventListener("click", () => {
  const error = cekDetail();
  if (error) { tulisPesan("pesan-detail", error, "salah"); return; }
  tulisPesan("pesan-detail", "");
  tampil("bayar");
});

$("tombol-kembali-bayar").addEventListener("click", () => tampil("detail"));

$("tombol-bayar").addEventListener("click", () => {
  const metode = document.querySelector('input[name="metode"]:checked').value;
  let kode = "SIM";
  for (let i = 0; i < 10; i++) kode += Math.floor(Math.random() * 10);
  $("metode-dipilih").textContent = metode;
  $("kode-bayar").textContent = kode;
  $("kotak-menunggu").hidden = false;
  $("tombol-bayar").disabled = true;
  $("tombol-kembali-bayar").disabled = true;
  hentikanTimer();
  reservasi = false;     // stok dianggap terjual, tidak dikembalikan lagi
  sudahBayar = true;
});

$("tombol-ulang").addEventListener("click", () => {
  pilihan = null;
  sudahBayar = false;
  $("kotak-menunggu").hidden = true;
  $("tombol-bayar").disabled = false;
  $("tombol-kembali-bayar").disabled = false;
  kosongkanForm();
  perbaruiKategori();
  isiRingkasan();
  tampil("pilih");
});

bangunKategori();
perbaruiKategori();
isiRingkasan();
tampil("auth");