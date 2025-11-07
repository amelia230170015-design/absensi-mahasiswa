// ------------------ IMPORT FIREBASE ------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// ------------------ KONFIGURASI FIREBASE ------------------
const firebaseConfig = {
  apiKey: "AIzaSyCV20g-sO-Gx-ka_kve0JktBFS8ygn9AxE",
  authDomain: "absensi-mahasiswa-e1aa8.firebaseapp.com",
  projectId: "absensi-mahasiswa-e1aa8",
  databaseURL: "https://absensi-mahasiswa-e1aa8-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "absensi-mahasiswa-e1aa8.firebasestorage.app",
  messagingSenderId: "461032556163",
  appId: "1:461032556163:web:a3de965c0758d0145efdb6",
  measurementId: "G-S929PVLK54",
};

// ------------------ INISIALISASI ------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ------------------ LOGIN ------------------
window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (!email || !password) {
    msg.style.color = "red";
    msg.innerText = "Isi email dan password terlebih dahulu.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    msg.style.color = "green";
    msg.innerText = "Login berhasil! Mengalihkan...";
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } catch (error) {
    msg.style.color = "red";
    msg.innerText = "Login gagal: " + error.message;
  }
};

// ------------------ CEK STATUS LOGIN ------------------
onAuthStateChanged(auth, (user) => {
  const isDashboard = window.location.pathname.includes("dashboard");
  const isLihat = window.location.pathname.includes("lihat.html");

  // Jika user belum login tapi ada di dashboard
  if (isDashboard && !user) {
    window.location.href = "index.html";
  }

  // Jika user sudah login, tampilkan identitas
  if (user && document.getElementById("user")) {
    document.getElementById("user").innerText = `Login sebagai: ${user.email}`;
    if (isDashboard) loadMahasiswa();
    if (isLihat) loadRekap();
  }
});

// ------------------ LOGOUT ------------------
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

// ------------------ DATA MAHASISWA (sementara statis) ------------------
const dataMahasiswa = [
  { nim: "23001", nama: "Amelia Zaliyanti" },
  { nim: "23002", nama: "Dewi Anggraini" },
  { nim: "23003", nama: "Rizky Hidayat" },
];

// ------------------ TAMPILKAN DAFTAR MAHASISWA ------------------
window.loadMahasiswa = function () {
  const table = document.getElementById("absensi-table");
  if (!table) return;

  // Kosongkan isi tabel dulu (agar tidak dobel)
  table.innerHTML = `
    <tr>
      <th>NIM</th>
      <th>Nama</th>
      <th>Status</th>
    </tr>
  `;

  dataMahasiswa.forEach((m) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.nim}</td>
      <td>${m.nama}</td>
      <td>
        <select id="status-${m.nim}">
          <option value="Hadir">Hadir</option>
          <option value="Izin">Izin</option>
          <option value="Sakit">Sakit</option>
          <option value="Alfa">Alfa</option>
        </select>
      </td>
    `;
    table.appendChild(tr);
  });
};

// ------------------ SIMPAN ABSENSI ------------------
window.simpanAbsensi = function () {
  const tanggal = document.getElementById("tanggal").value;
  if (!tanggal) {
    alert("Pilih tanggal terlebih dahulu!");
    return;
  }

  dataMahasiswa.forEach((m) => {
    const status = document.getElementById(`status-${m.nim}`).value;
    const absensiRef = ref(db, "absensi/" + tanggal + "/" + m.nim);
    set(absensiRef, {
      nim: m.nim,
      nama: m.nama,
      status: status,
      tanggal: tanggal,
    });
  });

  alert("Absensi berhasil disimpan!");
};

// ------------------ LIHAT REKAP ------------------
window.loadRekap = function () {
  const table = document.getElementById("rekap-table");
  if (!table) return;

  table.innerHTML = `
    <tr>
      <th>Tanggal</th>
      <th>NIM</th>
      <th>Nama</th>
      <th>Status</th>
    </tr>
  `;

  const dbRef = ref(db);
  get(child(dbRef, "absensi")).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      for (const tgl in data) {
        for (const nim in data[tgl]) {
          const d = data[tgl][nim];
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${tgl}</td>
            <td>${d.nim}</td>
            <td>${d.nama}</td>
            <td>${d.status}</td>
          `;
          table.appendChild(tr);
        }
      }
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4">Belum ada data absensi.</td>`;
      table.appendChild(tr);
    }
  });
};
