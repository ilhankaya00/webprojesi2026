// ===================================================================
// KODLINGO - WEB UYGULAMASI JAVASCRIPT KODLARI
// ===================================================================

// Global degiskenler (Kullanici Durumu)
var secili_dil = "python";
var kullanici_can = 5;
var kullanici_elmas = 150;
var gun_serisi = 3;
var toplam_tp = 145;
var gunluk_ders_sayisi = 1;

// Suanki quiz durumu icin degiskenler
var aktif_soru_listesi = [];
var suanki_soru_index = 0;
var secilen_secenek_index = null;
var kontrol_edildi_mi = false;

// Modal onay fonksiyonu icin gecici degisken
var modal_onay_callback = null;

// ===================================================================
// DILLERIN SVG LOGOLARI
// ===================================================================
var dilSvgLogolari = {
  python: '<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#3776AB" d="M11.9 2c-3.1 0-2.9 1.3-2.9 1.3l.03 1.4h3v.4H6.2S4 4.8 4 8c0 3.1 1.9 3 1.9 3h1.1V9.5s-.06-1.3 1.3-1.3h5.2s1.25.02 1.25-1.2V4.4S15.3 2 11.9 2zm-1.8 1.1a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4z"/><path fill="#FFD43B" d="M12.1 22c3.1 0 2.9-1.3 2.9-1.3l-.03-1.4h-3v-.4h5.8s2.2.3 2.2-2.9c0-3.1-1.9-3-1.9-3h-1.1v1.5s.06 1.3-1.3 1.3H10.5s-1.25-.02-1.25 1.2v2.6s-.5 2.4 2.85 2.4zm1.8-1.1a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4z"/></svg>',
  java: '<svg width="22" height="22" viewBox="0 0 24 24" fill="#E76F00"><path d="M4 19h14a2 2 0 0 0 2-2v-1h-2v1H4v-7h14V9H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm16-7v2h1a1 1 0 0 0 1-1v0a1 1 0 0 0-1-1h-1zM8 3c0 2-2 3-2 5h2c0-1.5 2-2.5 2-5H8zm5 0c0 2-2 3-2 5h2c0-1.5 2-2.5 2-5h-2z"/></svg>',
  rust: '<svg width="22" height="22" viewBox="0 0 24 24" fill="#CE422B"><circle cx="12" cy="12" r="9" stroke="#CE422B" stroke-width="2" fill="none"/><path d="M8 8h5a3 3 0 0 1 0 6H8zm2 2v2h3a1 1 0 0 0 0-2zm3 4l3 4h-2.5l-2.5-4z"/></svg>',
  c_cpp: '<svg width="22" height="22" viewBox="0 0 24 24" fill="#00599C"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm-2 13a4 4 0 0 1-4-4 4 4 0 0 1 4-4c1.6 0 3 1 3.6 2.3l-1.8.9A2 2 0 0 0 10 9a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 1.8-1.2l1.8.9A4 4 0 0 1 10 15zm8-3h-1.5v1.5h-1V12H14v-1h1.5V9.5h1V11h1.5v1z"/></svg>',
  flutter: '<svg width="22" height="22" viewBox="0 0 24 24" fill="#02569B"><polygon points="13.5,2 3.5,12 6.5,15 19.5,2"/><polygon points="13.5,13.5 8,19 11,22 16.5,16.5"/><polygon points="16.5,10.5 11,16 14,19 22.5,10.5" fill="#0175C2"/></svg>',
  html_css: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E44D26" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline><line x1="10" y1="21" x2="14" y2="3" stroke="#264DE4"></line></svg>'
};

// ===================================================================
// YENI SES MOTORU (Web Audio API - Duolingo Tarzi Yumusak Akorlar)
// Kulak tirmalayan bipler yerine temiz muzik akorlari caliyor
// ===================================================================
var audioCtx = null;

function sesMotorunuHazirla() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Yumusak nota calmak icin yardimci
function notaCal(frekans, baslangic, sure, tip, maxGain) {
  var ctx = sesMotorunuHazirla();
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();

  osc.type = tip || "sine";
  osc.frequency.setValueAtTime(frekans, baslangic);

  gain.gain.setValueAtTime(0.001, baslangic);
  gain.gain.exponentialRampToValueAtTime(maxGain || 0.15, baslangic + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, baslangic + sure);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(baslangic);
  osc.stop(baslangic + sure);
}

function sesCal(tur) {
  try {
    var ctx = sesMotorunuHazirla();
    var now = ctx.currentTime;

    if (tur === "dogru") {
      // Duolingo tarzi tatli yukselen 3 nota akoru (E5 -> G#5 -> B5 -> E6)
      notaCal(659.25, now, 0.35, "sine", 0.16);         // E5
      notaCal(830.61, now + 0.08, 0.35, "sine", 0.18);    // G#5
      notaCal(987.77, now + 0.16, 0.40, "sine", 0.20);    // B5
      notaCal(1318.51, now + 0.24, 0.45, "triangle", 0.15); // E6
    } 
    else if (tur === "yanlis") {
      // Duolingo tarzi yumusak iki adimli dusus (kulak tirmalamayan ahsap/tok ses)
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      var filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, now);

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } 
    else if (tur === "tik") {
      // Baloncuk patlamasi gibi cok hafif klik sesi
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    }
    else if (tur === "odul") {
      // Hazine sandigi acilinca parilti sesi
      var notalar = [1046.50, 1318.51, 1567.98, 2093.00];
      for (var i = 0; i < notalar.length; i++) {
        notaCal(notalar[i], now + (i * 0.07), 0.3, "sine", 0.12);
      }
    }
    else if (tur === "kutlama") {
      // Ders bitince fanfar akoru
      notaCal(523.25, now, 0.4, "sine", 0.15);        // C5
      notaCal(659.25, now + 0.1, 0.4, "sine", 0.18);  // E5
      notaCal(783.99, now + 0.2, 0.4, "sine", 0.20);  // G5
      notaCal(1046.50, now + 0.3, 0.6, "triangle", 0.22); // C6
    }
  } catch (err) {
    console.log("Ses motoru hatasi (onemsiz):", err);
  }
}

// ===================================================================
// SITE-ICI MODAL SISTEMI
// ===================================================================
function siteModalAc(secenekler) {
  // secenekler: { baslik, mesaj, tip, butonMetni, iptalMetni, onayCallback }
  var overlay = document.getElementById("site-bilgi-modali");
  var baslikEl = document.getElementById("site-modal-baslik");
  var mesajEl = document.getElementById("site-modal-mesaj");
  var ikonEl = document.getElementById("site-modal-ikon");
  var butonlarEl = document.getElementById("site-modal-butonlar");

  baslikEl.innerText = secenekler.baslik || "Bildirim";
  mesajEl.innerText = secenekler.mesaj || "";
  modal_onay_callback = secenekler.onayCallback || null;

  // Ikon secimi (SVG vektor)
  var ikonSvg = "";
  var tip = secenekler.tip || "bilgi";

  if (tip === "basari") {
    ikonSvg = '<svg width="56" height="56" viewBox="0 0 24 24" fill="#58cc02"><circle cx="12" cy="12" r="10" fill="#d7ffb8"/><path d="M9 12l2 2 4-4" stroke="#58cc02" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  } else if (tip === "hata" || tip === "uyari") {
    ikonSvg = '<svg width="56" height="56" viewBox="0 0 24 24" fill="#ff4b4b"><circle cx="12" cy="12" r="10" fill="#ffdfe0"/><line x1="12" y1="8" x2="12" y2="12" stroke="#ea2b2b" stroke-width="2.5" stroke-linecap="round"/><circle cx="12" cy="16" r="1.2" fill="#ea2b2b"/></svg>';
  } else if (tip === "sandik" || tip === "odul") {
    ikonSvg = '<svg width="56" height="56" viewBox="0 0 24 24" fill="#1cb0f6"><circle cx="12" cy="12" r="10" fill="#ddf4ff"/><polygon points="6,6 18,6 21,11 12,20 3,11" stroke="#1899d6" stroke-width="1.8" fill="#1cb0f6"/></svg>';
  } else if (tip === "kilit") {
    ikonSvg = '<svg width="56" height="56" viewBox="0 0 24 24" fill="#ff9600"><circle cx="12" cy="12" r="10" fill="#ffe9c7"/><rect x="8" y="11" width="8" height="7" rx="1.5" fill="#ff9600"/><path d="M10 11V8.5a2 2 0 0 1 4 0V11" stroke="#ff9600" stroke-width="2" fill="none"/></svg>';
  } else {
    // Standart bilgi
    ikonSvg = '<svg width="56" height="56" viewBox="0 0 24 24" fill="#1cb0f6"><circle cx="12" cy="12" r="10" fill="#ddf4ff"/><circle cx="12" cy="8" r="1.2" fill="#1cb0f6"/><line x1="12" y1="11" x2="12" y2="16" stroke="#1cb0f6" stroke-width="2.5" stroke-linecap="round"/></svg>';
  }

  ikonEl.innerHTML = ikonSvg;

  // Butonlar olusturuluyor
  butonlarEl.innerHTML = "";

  if (secenekler.iptalMetni) {
    var iptalBtn = document.createElement("button");
    iptalBtn.className = "site-modal-btn ikincil";
    iptalBtn.innerText = secenekler.iptalMetni;
    iptalBtn.onclick = function() {
      siteModalKapat();
    };
    butonlarEl.appendChild(iptalBtn);
  }

  var anaBtn = document.createElement("button");
  anaBtn.className = "site-modal-btn ana";
  if (tip === "hata") anaBtn.className = "site-modal-btn kirmizi";
  if (tip === "sandik" || tip === "bilgi") anaBtn.className = "site-modal-btn mavi";
  
  anaBtn.innerText = secenekler.butonMetni || "TAMAM";
  anaBtn.onclick = function() {
    siteModalKapat();
    if (modal_onay_callback) {
      modal_onay_callback();
    }
  };
  butonlarEl.appendChild(anaBtn);

  // Modali goster
  overlay.classList.remove("gizli");
}

function siteModalKapat() {
  sesCal("tik");
  var overlay = document.getElementById("site-bilgi-modali");
  overlay.classList.add("gizli");
}

// ===================================================================
// DILLERE GORE SORU VE DERS VERILERI
// ===================================================================
var dilVerileri = {
  python: {
    isim: "Python",
    bolumBaslik: "Temel Sözdizimi & İlk Kodlar",
    bolumAciklama: "Ekrana yazdırma, değişken tanımlama ve temel mantık",
    sorular: [
      {
        kategori: "Python Temelleri",
        soru: "Python'da ekrana yazı bastırmak için hangi fonksiyon kullanılır?",
        kod: "# Ekrana 'Selam Dünya' yazdırmak istiyoruz:\n???(\"Selam Dünya\")",
        secenekler: ["print()", "echo()", "console.log()", "System.out.println()"],
        dogru: 0,
        aciklama: "Python'da konsola yazı print() fonksiyonu ile yazdırılır."
      },
      {
        kategori: "Python Değişkenleri",
        soru: "Aşağıdaki kod çalıştırıldığında çıktı ne olur?",
        kod: "sayi1 = 10\nsayi2 = 5\nsonuc = sayi1 + sayi2\nprint(sonuc)",
        secenekler: ["105", "15", "sayi1 + sayi2", "Hata verir"],
        dogru: 1,
        aciklama: "10 ile 5 toplanınca sonuç 15 olur."
      },
      {
        kategori: "Python Veri Tipleri",
        soru: "Python'da 'True' veya 'False' değerleri hangi veri tipidir?",
        kod: "aktif_mi = True\nprint(type(aktif_mi))",
        secenekler: ["string", "int", "bool (Boolean)", "float"],
        dogru: 2,
        aciklama: "True ve False mantıksal Boolean veri tipidir."
      }
    ]
  },

  java: {
    isim: "Java",
    bolumBaslik: "OOP & Java Temelleri",
    bolumAciklama: "Main metodu, class yapıları ve tip tanımları",
    sorular: [
      {
        kategori: "Java Giriş",
        soru: "Bir Java programının başlangıç noktası hangi metottur?",
        kod: "public class Main {\n    public static void ???(String[] args) {\n        // Kod burda başlar\n    }\n}",
        secenekler: ["start()", "main", "run()", "init()"],
        dogru: 1,
        aciklama: "Java uygulamaları 'public static void main' metoduyla çalışmaya başlar."
      },
      {
        kategori: "Java Konsol",
        soru: "Java'da konsola satır yazdırmak için ne yazılır?",
        kod: "public static void main(String[] args) {\n    ???.println(\"KodLingo\");\n}",
        secenekler: ["System.out", "Console.write", "print", "echo"],
        dogru: 0,
        aciklama: "Java'da konsola çıktı System.out.println() ile verilir."
      }
    ]
  },

  rust: {
    isim: "Rust",
    bolumBaslik: "Güvenli Bellek & Rust Temelleri",
    bolumAciklama: "fn main, mut anahtar kelimesi ve sahiplik (ownership)",
    sorular: [
      {
        kategori: "Rust Değişkenleri",
        soru: "Rust'ta değişkenler varsayılan olarak nasıldır?",
        kod: "fn main() {\n    let x = 5;\n    x = 6; // Hata verir mi?\n}",
        secenekler: ["Değiştirilemez (Immutable)", "Her zaman değiştirilebilir", "Sadece string olabilir", "Globaldir"],
        dogru: 0,
        aciklama: "Rust'ta 'let' ile tanımlanan değişkenler varsayılan olarak immutable (değiştirilemez) olur. Değiştirmek için 'let mut' gerekir."
      },
      {
        kategori: "Rust Makroları",
        soru: "Rust'ta konsola yazdırmak için sonuna '!' alan makro hangisidir?",
        kod: "fn main() {\n    ???(\"Merhaba Rustaceans!\");\n}",
        secenekler: ["println!", "print_line", "echo!", "write!"],
        dogru: 0,
        aciklama: "Rust'ta ekrana yazdırmak için println! makrosu kullanılır."
      }
    ]
  },

  c_cpp: {
    isim: "C / C++",
    bolumBaslik: "Sistem Programlama & Pointer",
    bolumAciklama: "#include kütüphaneleri, printf ve işaretçi mantığı",
    sorular: [
      {
        kategori: "C Dili Temelleri",
        soru: "C dilinde standart giriş/çıkış için hangi başlık dosyası dahil edilir?",
        kod: "#include <???.h>\n\nint main() {\n    printf(\"Selam C\");\n    return 0;\n}",
        secenekler: ["stdio", "iostream", "math", "windows"],
        dogru: 0,
        aciklama: "printf ve scanf için <stdio.h> (Standard Input Output) gereklidir."
      },
      {
        kategori: "C Dili İşaretçiler",
        soru: "Bir değişkenin bellek adresini tutan özel değişken tipine ne ad verilir?",
        kod: "int sayi = 42;\nint *ptr = &sayi; // ptr nedir?",
        secenekler: ["Pointer (İşaretçi)", "Array", "Float", "Macro"],
        dogru: 0,
        aciklama: "* ile tanımlanan ve & ile adres alan değişkenler pointer'dır."
      }
    ]
  },

  flutter: {
    isim: "Flutter (Dart)",
    bolumBaslik: "Widget Dünyası & Arayüz",
    bolumAciklama: "Stateless/Stateful widgetlar ve mobil sayfa yapısı",
    sorular: [
      {
        kategori: "Flutter Felsefesi",
        soru: "Flutter'da arayüzdeki hemen hemen her şey bir nedir?",
        kod: "// Buton, metin, padding hatta sayfanın kendisi bile...\nclass MyWidget extends StatelessWidget { ... }",
        secenekler: ["Widget", "HTML etiketi", "Activity", "Component"],
        dogru: 0,
        aciklama: "Flutter'ın mottosu 'Everything is a widget' yani her şey bir widget'tır."
      },
      {
        kategori: "Flutter Metotları",
        soru: "Bir StatelessWidget oluştururken hangi metodu override etmek zorundayız?",
        kod: "class KodLingoApp extends StatelessWidget {\n  @override\n  Widget ???(BuildContext context) {\n    return Container();\n  }\n}",
        secenekler: ["build", "render", "create", "start"],
        dogru: 0,
        aciklama: "Tüm widgetlar çizilmek için 'Widget build(BuildContext context)' metoduna ihtiyaç duyar."
      }
    ]
  },

  html_css: {
    isim: "HTML & CSS",
    bolumBaslik: "Web Tasarım & İskelet",
    bolumAciklama: "Etiketler, flexbox ve sayfa yerleşimleri",
    sorular: [
      {
        kategori: "HTML Temelleri",
        soru: "Bir sayfadaki en önemli ve en büyük başlık için hangi HTML etiketi kullanılır?",
        kod: "<???>Sitemize Hoş Geldiniz</???>",
        secenekler: ["<h1>", "<header>", "<h6>", "<title>"],
        dogru: 0,
        aciklama: "En büyük ve ana başlık etiketi <h1>'dir."
      },
      {
        kategori: "CSS Hizalama",
        soru: "CSS'te elemanları kolayca yan yana dizmek ve esnek kutu yapmak için ne kullanılır?",
        kod: ".kutu-alani {\n    display: ???;\n    justify-content: center;\n}",
        secenekler: ["flex", "inline", "fixed", "hidden"],
        dogru: 0,
        aciklama: "Modern web tasarımında esnek kutu modeli için 'display: flex;' kullanılır."
      }
    ]
  }
};

// ===================================================================
// SAYFA DEGISIKLIGI / MENU GECISLERI (Sekmeler arasi gecis)
// ===================================================================
function sayfaDegistir(sayfaAdi) {
  sesCal("tik");
  console.log("Menu tiklandi, gidilen sayfa: " + sayfaAdi);

  var sayfalar = document.querySelectorAll(".sayfa-bolumu");
  for (var i = 0; i < sayfalar.length; i++) {
    sayfalar[i].classList.remove("aktif");
  }

  var butonlar = document.querySelectorAll(".menu-btn");
  for (var j = 0; j < butonlar.length; j++) {
    butonlar[j].classList.remove("aktif");
  }

  var hedefSayfa = document.getElementById("sayfa-" + sayfaAdi);
  var hedefButon = document.getElementById("btn-" + sayfaAdi);

  if (hedefSayfa) {
    hedefSayfa.classList.add("aktif");
  }
  if (hedefButon) {
    hedefButon.classList.add("aktif");
  }

  if (sayfaAdi === "profil") {
    profilGuncelle();
  }
}

// ===================================================================
// DIL SECME VE DROPDOWN KONTROLU
// ===================================================================
function dilMenusuAcKapat() {
  sesCal("tik");
  var menu = document.getElementById("dil-dropdown-menu");
  if (menu.classList.contains("gizli")) {
    menu.classList.remove("gizli");
  } else {
    menu.classList.add("gizli");
  }
}

document.addEventListener("click", function(event) {
  var buton = document.getElementById("dil-secim-butonu");
  var menu = document.getElementById("dil-dropdown-menu");
  if (buton && menu) {
    if (!buton.contains(event.target) && !menu.contains(event.target)) {
      menu.classList.add("gizli");
    }
  }
});

function dilSec(dilKodu) {
  sesCal("tik");
  secili_dil = dilKodu;

  var secilenBilgi = dilVerileri[dilKodu];
  if (!secilenBilgi) return;

  // Ust bardaki dil logosu (SVG) ve adi guncellenir
  var svgKodu = dilSvgLogolari[dilKodu] || "";
  document.getElementById("aktif-dil-ikonu").innerHTML = svgKodu;
  document.getElementById("aktif-dil-adi").innerText = secilenBilgi.isim;

  // Kurs banner'ini guncelle
  document.getElementById("banner-bolum-baslik").innerText = secilenBilgi.bolumBaslik;
  document.getElementById("banner-bolum-aciklama").innerText = secilenBilgi.bolumAciklama;

  // Dropdown'u kapat
  document.getElementById("dil-dropdown-menu").classList.add("gizli");

  // Liderlik tablosundaki aktif dil yazisi
  if (document.getElementById("liderlik-aktif-dil")) {
    document.getElementById("liderlik-aktif-dil").innerText = secilenBilgi.isim + " Kursu";
  }

  // Ogren sayfasina gecirelim
  sayfaDegistir("ogren");
}

// ===================================================================
// QUIZ / DERS SISTEMI
// ===================================================================
function dersBaslat(dersNo) {
  sesCal("tik");

  if (kullanici_can <= 0) {
    siteModalAc({
      baslik: "Canların Tükendi!",
      mesaj: "Hiç canın kalmadı. Mağazadan topladığın elmaslarla canlarını hemen 5'e tamamlayabilirsin.",
      tip: "uyari",
      butonMetni: "MAĞAZAYA GİT",
      onayCallback: function() {
        sayfaDegistir("magaza");
      }
    });
    return;
  }

  var dil = dilVerileri[secili_dil];
  aktif_soru_listesi = dil.sorular;
  suanki_soru_index = 0;
  secilen_secenek_index = null;
  kontrol_edildi_mi = false;

  var modal = document.getElementById("quiz-modali");
  modal.classList.remove("gizli");

  soruyuEkranaBas();
}

function soruyuEkranaBas() {
  kontrol_edildi_mi = false;
  secilen_secenek_index = null;

  var soruObj = aktif_soru_listesi[suanki_soru_index];
  var toplamSoru = aktif_soru_listesi.length;

  var yuzde = ((suanki_soru_index) / toplamSoru) * 100;
  document.getElementById("quiz-ilerleme-cubugu").style.width = yuzde + "%";

  document.getElementById("quiz-can-sayi").innerText = kullanici_can;

  document.getElementById("soru-kategori-etiket").innerText = soruObj.kategori;
  document.getElementById("soru-basligi").innerText = soruObj.soru;
  document.getElementById("soru-kod-icerik").innerText = soruObj.kod;

  var altBar = document.getElementById("quiz-alt-paneli");
  altBar.className = "quiz-alt-bar normal-durum";
  document.getElementById("quiz-bildirim-alani").classList.add("gizli");

  var kontrolBtn = document.getElementById("btn-kontrol");
  kontrolBtn.innerText = "KONTROL ET";
  kontrolBtn.className = "kontrol-btn pasif";

  document.getElementById("btn-atla").classList.remove("gizli");

  var secenekKutusu = document.getElementById("secenekler-kutusu");
  secenekKutusu.innerHTML = "";

  for (var i = 0; i < soruObj.secenekler.length; i++) {
    var secenekMetin = soruObj.secenekler[i];
    var btn = document.createElement("button");
    btn.className = "secenek-butonu";
    btn.setAttribute("onclick", "secenekSec(" + i + ")");
    btn.innerHTML = "<span class='secenek-no'>" + (i + 1) + "</span><span>" + secenekMetin + "</span>";
    secenekKutusu.appendChild(btn);
  }
}

function secenekSec(index) {
  if (kontrol_edildi_mi) return;

  sesCal("tik");
  secilen_secenek_index = index;

  var butonlar = document.querySelectorAll(".secenek-butonu");
  for (var i = 0; i < butonlar.length; i++) {
    if (i === index) {
      butonlar[i].classList.add("secili");
    } else {
      butonlar[i].classList.remove("secili");
    }
  }

  var kontrolBtn = document.getElementById("btn-kontrol");
  kontrolBtn.classList.remove("pasif");
}

function cevabiKontrolEt() {
  var soruObj = aktif_soru_listesi[suanki_soru_index];
  var altBar = document.getElementById("quiz-alt-paneli");
  var bildirimAlani = document.getElementById("quiz-bildirim-alani");
  var bildirimBaslik = document.getElementById("bildirim-baslik");
  var bildirimAciklama = document.getElementById("bildirim-aciklama");
  var ikonAlani = document.getElementById("bildirim-ikon-alani");
  var kontrolBtn = document.getElementById("btn-kontrol");
  var atlaBtn = document.getElementById("btn-atla");

  if (kontrol_edildi_mi) {
    sesCal("tik");
    suanki_soru_index++;

    if (suanki_soru_index >= aktif_soru_listesi.length) {
      dersiBitir();
    } else {
      soruyuEkranaBas();
    }
    return;
  }

  if (secilen_secenek_index === null) {
    siteModalAc({
      baslik: "Seçenek İşaretle",
      mesaj: "Devam edebilmek için lütfen şıklardan birini seçin.",
      tip: "uyari",
      butonMetni: "ANLADIM"
    });
    return;
  }

  kontrol_edildi_mi = true;
  atlaBtn.classList.add("gizli");
  bildirimAlani.classList.remove("gizli");

  if (secilen_secenek_index === soruObj.dogru) {
    // DOGRU CEVAP
    sesCal("dogru");
    altBar.className = "quiz-alt-bar dogru-durum";
    ikonAlani.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="#58cc02"><circle cx="12" cy="12" r="10" fill="#ffffff"/><path d="M9 12l2 2 4-4" stroke="#58cc02" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    bildirimBaslik.innerText = "Harikasın! Doğru Cevap!";
    bildirimAciklama.innerText = soruObj.aciklama;
    kontrolBtn.innerText = "DEVAM ET";
  } else {
    // YANLIS CEVAP
    sesCal("yanlis");
    altBar.className = "quiz-alt-bar yanlis-durum";
    ikonAlani.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="#ff4b4b"><circle cx="12" cy="12" r="10" fill="#ffffff"/><line x1="15" y1="9" x2="9" y2="15" stroke="#ea2b2b" stroke-width="2.5" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="#ea2b2b" stroke-width="2.5" stroke-linecap="round"/></svg>';
    bildirimBaslik.innerText = "Doğru Cevap: " + soruObj.secenekler[soruObj.dogru];
    bildirimAciklama.innerText = soruObj.aciklama;
    kontrolBtn.innerText = "ANLADIM";

    kullanici_can--;
    if (kullanici_can < 0) kullanici_can = 0;
    document.getElementById("stat-can").innerText = kullanici_can;
    document.getElementById("quiz-can-sayi").innerText = kullanici_can;

    if (kullanici_can === 0) {
      siteModalAc({
        baslik: "Dikkat! Canın Kalmadı",
        mesaj: "Son canını da kaybettin! Dersi tamamlamak için canlarını doldurman gerekebilir.",
        tip: "hata",
        butonMetni: "ANLADIM"
      });
    }
  }
}

function soruAtla() {
  sesCal("tik");
  suanki_soru_index++;
  if (suanki_soru_index >= aktif_soru_listesi.length) {
    dersiBitir();
  } else {
    soruyuEkranaBas();
  }
}

// Dersten cikarken site-ici modal ile onay soruluyor
function dersiKapatOnay() {
  sesCal("tik");
  siteModalAc({
    baslik: "Dersten Çıkmak İstiyor musun?",
    mesaj: "Şimdi çıkarsan bu dersteki ilerlemen kaydedilmeyecek ve başa döneceksin.",
    tip: "uyari",
    iptalMetni: "ÇALIŞMAYA DEVAM ET",
    butonMetni: "EVET, ÇIK",
    onayCallback: function() {
      document.getElementById("quiz-modali").classList.add("gizli");
    }
  });
}

function dersiBitir() {
  sesCal("kutlama");
  document.getElementById("quiz-modali").classList.add("gizli");
  document.getElementById("tebrik-modali").classList.remove("gizli");

  toplam_tp += 15;
  kullanici_elmas += 10;
  gunluk_ders_sayisi = 2;

  document.getElementById("stat-elmas").innerText = kullanici_elmas;
  document.getElementById("gunluk-hedef-yazisi").innerText = "2 / 2 Ders (Tamamlandı!)";
  document.getElementById("gunluk-hedef-bari").style.width = "100%";
  document.getElementById("gunluk-hedef-bari").style.backgroundColor = "#58cc02";
  
  if (document.getElementById("liderlik-bizim-xp")) {
    document.getElementById("liderlik-bizim-xp").innerText = toplam_tp + " TP";
  }
}

function tebrikKapat() {
  sesCal("tik");
  document.getElementById("tebrik-modali").classList.add("gizli");
  
  var adim2 = document.querySelector(".adim-butonu.aktif");
  if (adim2) {
    adim2.className = "adim-butonu tamamlandi";
    adim2.innerHTML = '<span class="adim-yildiz"><svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg></span><span class="adim-etiket">Bitti</span>';
  }
}

// ===================================================================
// BONUS SANDIK VE KILITLI ADIMLAR (Site Modali ile)
// ===================================================================
function sandikAc() {
  sesCal("odul");
  kullanici_elmas += 20;
  document.getElementById("stat-elmas").innerText = kullanici_elmas;

  siteModalAc({
    baslik: "Hazine Sandığı Açıldı!",
    mesaj: "Tebrikler! Günlük bonus sandığından hesabına +20 Elmas eklendi.",
    tip: "sandik",
    butonMetni: "ÖDÜLÜ AL"
  });
}

function kilitliDersUyarisi() {
  sesCal("yanlis");
  siteModalAc({
    baslik: "Ders Kilitli",
    mesaj: "Bu aşamaya geçebilmek için lütfen önceki temel dersleri ve alıştırmaları başarıyla tamamlayın.",
    tip: "kilit",
    butonMetni: "ANLADIM"
  });
}

function rehberGoster() {
  sesCal("tik");
  var dil = dilVerileri[secili_dil];
  siteModalAc({
    baslik: dil.isim + " Kurs Rehberi",
    mesaj: dil.bolumBaslik + "\n" + dil.bolumAciklama + "\n\nHer gün en az bir ders çözerek serinizi koruyabilir ve liderlik tablosunda yükselebilirsiniz.",
    tip: "bilgi",
    butonMetni: "TAMAM"
  });
}

// ===================================================================
// MAGAZA SATIN ALMA ISLEMLERI (Site Modali ile)
// ===================================================================
function urunAl(urunKodu, fiyat) {
  if (kullanici_elmas < fiyat) {
    sesCal("yanlis");
    siteModalAc({
      baslik: "Yetersiz Elmas",
      mesaj: "Bu öğeyi almak için " + fiyat + " elmasa ihtiyacınız var. Daha fazla ders çözerek elmas kazanabilirsiniz.",
      tip: "uyari",
      butonMetni: "ANLADIM"
    });
    return;
  }

  sesCal("dogru");
  kullanici_elmas -= fiyat;
  document.getElementById("stat-elmas").innerText = kullanici_elmas;

  if (urunKodu === "can") {
    kullanici_can = 5;
    document.getElementById("stat-can").innerText = kullanici_can;
    siteModalAc({
      baslik: "Canların Yenilendi!",
      mesaj: "Tüm canların 5/5 olarak dolduruldu. Artık derslerine kaldığın yerden devam edebilirsin.",
      tip: "basari",
      butonMetni: "DEVAM ET"
    });
  } 
  else if (urunKodu === "dondurucu") {
    siteModalAc({
      baslik: "Seri Dondurucu Aktif!",
      mesaj: "Seri dondurucun hazır. Bir gün ders çalışmayı kaçırsan bile serin sıfırlanmayacak.",
      tip: "basari",
      butonMetni: "TAMAM"
    });
  }
  else if (urunKodu === "iksir") {
    siteModalAc({
      baslik: "2 Kat TP İksiri Aktif!",
      mesaj: "Önümüzdeki 15 dakika boyunca tamamlayacağın her dersten 2 kat fazla deneyim puanı kazanacaksın.",
      tip: "basari",
      butonMetni: "BAŞLA"
    });
  }
}

// ===================================================================
// PROFIL SAYFASINI GUNCELLEME
// ===================================================================
function profilGuncelle() {
  document.getElementById("profil-seri").innerText = gun_serisi;
  document.getElementById("profil-toplam-xp").innerText = toplam_tp;
  document.getElementById("profil-can-stat").innerText = kullanici_can;
}

// ===================================================================
// SAYFA ILK ACILDIGINDA CALISAN KODLAR
// ===================================================================
window.addEventListener("DOMContentLoaded", function() {
  console.log("KodLingo Web Projesi Basariyla Yuklendi! :)");
  dilSec("python");
});
