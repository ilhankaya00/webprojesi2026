# Yapay Zeka Destek ve Geliştirme Raporu (AI Log)

**Proje Adı:** KodLingo - Gamified Kodlama Öğrenme Platformu  
**Geliştiriciler:** İlhan Kaya, Süleyman E.  
**Ders:** Web Programlama / Proje Çalışması  

---

## 1. Giriş ve Proje Amacı
Bu projede amacım; Duolingo benzeri eğlenceli, ödüllendirme odaklı (can, elmas, seri ve lig sistemi) bir web tabanlı interaktif kodlama öğrenme platformu tasarlamaktı. Projenin genel mimarisi, sayfa yerleşimi, renk paleti ve kullanıcı deneyimi tarafımca planlanmıştır.

Geliştirme sürecinde özellikle teknik olarak daha ileri seviye matematik ve tarayıcı API'leri gerektiren bazı modüllerde üretici yapay zekadan (AI Asistanı) danışmanlık ve kod desteği alınmıştır. Bu dokümanda, yapay zekanın katkı sağladığı alanlar şeffaf bir şekilde özetlenmiştir.

---

## 2. Yapay Zekadan Destek Alınan Bölümler

### A. Web Audio API ve Frekans Bazlı Ses Sentezleme
* **Zorluk / İhtiyaç:** Projede harici `.mp3` veya `.wav` ses dosyaları indirmek istemedim; çünkü harici dosyalar dosya yolunun bozulması, CORS engeli veya yavaş yükleme gibi sorunlara yol açabiliyordu. Tarayıcının yerleşik ses motoruyla saf koddan ses üretmek istedim.
* **AI Desteği:**
  - `AudioContext`, `createOscillator()`, `createGain()` ve `createBiquadFilter()` zincirinin kurulması.
  - Müzikal akor frekanslarının (Hz) doğru hesaplanması:
    - Doğru cevap sesi için E5 (659Hz), G#5 (830Hz), B5 (987Hz) ve E6 (1318Hz) yükselen arpej notalarının belirlenmesi.
    - Yanlış cevap sesi için kulak tırmalamayan, ahşap/tok bir bas ses üreten 450Hz `lowpass` filtre ve frekans düşüş eğrisi (`exponentialRampToValueAtTime`) formülü.

### B. Inline Vektör SVG İkon Koordinatları
* **Zorluk / İhtiyaç:** Projede emoji kullanılmaması, onun yerine net, modern ve her ekranda net gözüken SVG vektör ikonların kullanılması hedeflendi.
* **AI Desteği:**
  - Desteklenen dillerin (Python çift yılanı, Rust dişli çarkı, C++ altıgeni, Flutter kanat geometrisi) ve arayüz sembollerinin (elmas, kalp, alev, hazine sandığı, kilit) matematiksel `path d="..."` ve `viewBox` koordinatlarının çizilmesinde yapay zekadan hazır vektör dizgileri üretmesi istendi.

### C. 3D Buton Basma Fiziği ve Elastik Modal Animasyonları
* **Zorluk / İhtiyaç:** Duolingo arayüzünün en belirgin özelliği butonların kalın alt kenarlığa basılarak fiziksel olarak aşağı çökmesidir. Ayrıca açılan pencerelerin yaylanarak (bounce/pop-in) gelmesi isteniyordu.
* **AI Desteği:**
  - Butonların `:active` durumunda `transform: translateY(2px)` ile `border-bottom-width` dengesinin bozulmadan tıklanma hissi vermesi.
  - Modal kutusu için `cubic-bezier(0.175, 0.885, 0.32, 1.275)` elastik yaylanma fonksiyonunun CSS `@keyframes` içine entegre edilmesi.

### D. Dinamik Tek-Parça Site İçi Modal Mimarisi
* **Zorluk / İhtiyaç:** Tarayıcının ilkel `alert()` ve `confirm()` kutuları web tasarımının bütünlüğünü bozuyordu. Sayfa içi asenkron çalışabilen, onay/iptal butonlarına özel callback fonksiyonları bağlanabilen bir yapı gerekiyordu.
* **AI Desteği:**
  - `siteModalAc(secenekler)` fonksiyonu yazılarak; başlık, mesaj, ikon türü (`basari`, `hata`, `kilit`, `sandik`) ve `onayCallback` parametrelerinin tek bir JavaScript fonksiyonundan yönetilmesi sağlandı.

### E. Çoklu Dil Soru Havuzu Düzenlemesi
* **Zorluk / İhtiyaç:** Python, Java, Rust, C/C++, Flutter ve HTML/CSS gibi 6 farklı dilin başlangıç seviyesine uygun, çoktan seçmeli ve kod bloklu sorularının hazırlanması.
* **AI Desteği:**
  - Her dilin temel sözdizimini (syntax) ölçen soru kalıplarının ve şıklarının nesne dizisi (`dilVerileri`) formatında JSON/JS veri yapısına dökülmesi.

---

## 3. Kendi Yaptığım ve Geliştirdiğim Bölümler
- Projenin HTML iskeleti, sol menü, sağ panel ve ders akış düzeni.
- Tab/menü geçiş mantığı (`sayfaDegistir`).
- Puan, can eksilme, seriyi (streak) tutma ve elmas harcama algoritmaları.
- Dil seçim açılır menüsü (dropdown) etkileşimi.
- Quiz ilerleme çubuğunun yüzde hesabı ve soru tamamlama döngüsü.
- Görsel tasarım, renk uyumları ve logo yerleşimi.

---

## 4. Sonuç
Yapay zeka bu projede bir "kod yazdırıp bırakma" aracı olarak değil; karmaşık Web Audio sentezi, SVG path matematiği ve animasyon formülleri gibi alanlarda bir **yardımcı ve teknik danışman** olarak kullanılmıştır.
