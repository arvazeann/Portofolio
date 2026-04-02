const tombolNavigasi = document.querySelectorAll(".tautan-navigasi");
const bilahProgress = document.querySelectorAll(".progress");
const tombolAtas = document.getElementById("tombolAtas");
const tombolHubungi = document.getElementById("tombolHubungi");
const tombolBelajar = document.getElementById("tombolBelajar");

function gulirKeTarget(idTarget) {
  const elemenTujuan = document.querySelector(idTarget);
  if (!elemenTujuan) return;

  const posisiAtas = elemenTujuan.offsetTop - 80;

  window.scrollTo({
    top: posisiAtas,
    behavior: "smooth",
  });
}

tombolHubungi.addEventListener("click", function () {
  this.style.transform = "scale(0.95)";

  gulirKeTarget("#kontak");

  setTimeout(() => {
    this.style.transform = "scale(1)";
  }, 200);
});

tombolBelajar.addEventListener("click", function () {
  this.style.transform = "scale(0.95)";

  gulirKeTarget("#skills");

  setTimeout(() => {
    this.style.transform = "scale(1)";
  }, 200);
});

tombolNavigasi.forEach((tombol) => {
  tombol.addEventListener("click", function (acara) {
    acara.preventDefault();

    const idTujuan = this.getAttribute("href");
    gulirKeTarget(idTujuan);
  });
});

const pengamatProgress = new IntersectionObserver(
  (semuaEntri) => {
    semuaEntri.forEach((entri) => {
      if (entri.isIntersecting) {
        const bilah = entri.target;
        const nilai = bilah.getAttribute("data-nilai");

        bilah.style.width = "0%";

        setTimeout(() => {
          bilah.style.width = nilai + "%";
        }, 200);
      }
    });
  },
  { threshold: 0.4 }
);

bilahProgress.forEach((bilah) => {
  pengamatProgress.observe(bilah);
});

function perbaruiNavAktif() {
  const semuaBagian = document.querySelectorAll("section");
  const tautanNavigasi = document.querySelectorAll(".tautan-navigasi");

  let bagianAktif = "";
  const posisiScroll = window.scrollY + 100;

  semuaBagian.forEach((bagian) => {
    const posisiAtas = bagian.offsetTop;
    const posisiBawah = posisiAtas + bagian.offsetHeight;

    if (posisiScroll >= posisiAtas && posisiScroll < posisiBawah) {
      bagianAktif = bagian.getAttribute("id");
    }
  });

  tautanNavigasi.forEach((tautan) => {
    tautan.classList.remove("aktif");
    if (tautan.getAttribute("href") === `#${bagianAktif}`) {
      tautan.classList.add("aktif");
    }
  });
}

tombolAtas.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

const semuaKartuSkill = document.querySelectorAll(".kartu-skill");
semuaKartuSkill.forEach((kartu) => {
  kartu.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-8px)";
  });

  kartu.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0)";
  });
});

window.addEventListener("scroll", () => {
  perbaruiNavAktif();

  if (window.scrollY > 500) {
    tombolAtas.classList.add("tampil");
  } else {
    tombolAtas.classList.remove("tampil");
  }
});

const pengamatAnimasi = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animasi-muncul-aktif");
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".animasi-muncul").forEach((elemen) => {
  pengamatAnimasi.observe(elemen);
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Website Rafif siap! Semua tombol berfungsi.");
  perbaruiNavAktif();

  bilahProgress.forEach((bilah) => {
    bilah.style.width = "0%";
  });
});

window.addEventListener("error", function (e) {
  console.log("❌ Error:", e.error);
});
