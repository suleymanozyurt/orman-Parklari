# Orman Parkları — kira, alacak ve denetim takibi

İstanbul Orman İşletme Müdürlüğü, Emlak Şefliği için orman parkı kira takip uygulaması (313 sayılı Orman Parkları Tebliği).
Telefona ve bilgisayara uygulama olarak kurulabilir (PWA).

**Adres:** https://suleymanozyurt.github.io/orman-Parklari/

## Nasıl çalışır
- **Veriler şifrelidir.** `data/veri.enc`, `data/ekler.enc` (Tebliğ ek şablonları, imzalı Ek-10 raporları, Tebliğ metni) ve `data/teblig.enc` AES-256-GCM ile şifrelenmiştir; erişim parolasını bilmeyen içeriği göremez.
- **Görüntüleme:** Linki ve erişim parolasını alan herkes bilgisayarda ve telefonda açar, yalnız görür.
- **Düzenleme:** “Yönetici girişi” yönetici parolasıyla yapılır. Parola, depodaki `data/yonetici.enc` dosyasını açar; içinde bu depoya yazma izni olan GitHub anahtarı şifreli durur. İlk kurulumda anahtar bir kez girilir (program GitHub’daki anahtar sayfasını hazır ayarlarla açar). Her değişiklik işlem geçmişine ve git sürüm geçmişine yazılır.
- **Ekler:** Tebliğin 18 eki orijinal düzeniyle ekranda doldurulur; çıktı yazdırma/PDF, Excel (Ek-1…10, 12…15, 18) ve Word (Ek-11, 16, 17) olarak alınır (`js/ekler.js`, `vendor/`).
- **Kira ve tahakkuk:** Sonraki yıl kirası Tebliğ zincirinden kendiliğinden hesaplanır; TÜFE açıklanmadıkça tutar gösterilmez. Tahakkuk tek tuşla işlenir; muhasebe dökümü gelince program kaydı devreden çıkar.
- **Hesaplar** tarayıcıda yapılır (`js/engine.js`): muhasebe dökümü eşleştirmesi, gecikme zammı (6183 s.K. m.51; Tebliğ Md. 39/1), kira zinciri (Md. 31–32), ek tesis kirası (Md. 30), teminatlar (Md. 8–10).
- **Rapor tarihi** her gün kendiliğinden bugündür.
- **Resmî oranlar** (`data/oranlar.json`, şifresiz) her gün `.github/workflows/oranlar.yml` ile güncellenir:
  - Gecikme zammı: Resmî Gazete günlük fihristi taranır.
  - TÜFE (on iki aylık ortalamalara göre): TÜİK Veri Portalı dağıtım servisi (anahtarsız; seri bilinen aylarla doğrulanmadan kabul edilmez). `TUIK_API_KEY` tanımlıysa SDMX servisi yedek olarak kullanılır.

## Yetkiler ve kişisel hesaplar
- **Görüntüleme:** erişim parolası ya da kişisel hesap.
- **Kişisel hesap** (`data/kullanicilar.enc`): her kişi kendi kullanıcı adı ve parolasıyla girer. Yetkiler ayrı verilir: *veri düzenleme*, *muhasebe yükleme*, *yönetim*. Kullanıcı adları ve yetki listesi şifrelidir (dizin anahtarı yalnız yönetim yetkilisinde). Her değişiklik işlem geçmişine ve git geçmişine kişinin adıyla yazılır.
- Program sunucusuz çalıştığından yetkiler program içinde uygulanır; yazma yetkili hesaplar depoya aynı GitHub anahtarıyla yazar. Bir kişinin erişimi tamamen kesilecekse hesabı silinir, ardından erişim parolası ve GitHub anahtarı yenilenir (hesaplar kendiliğinden güncellenir).

## Muhasebe dökümleri
- 120.99 ve 127 dökümleri CSV ya da Excel olarak yüklenir. Döküm tarihi, son yevmiye tarihi ve programa yükleme tarihi ayrı kaydedilir.
- Alacak ve gecikme zammı sonuçları son yevmiye tarihine kadarki kayıtları yansıtır; güncel borç durumu değildir. Yeni tahakkuk ya da ödeme olduğunda güncel döküm yüklenmelidir.
- Mükerrer önleme: aynı hesabın eski döküm satırları yenisiyle değişir; elle eklenmiş satırlardan dökümde birebir karşılığı (yevmiye no ve tarihi, hesap, vergi no, vade, borç, alacak) olanlar kaldırılır.

## Ek yapı ve tesis kirası (Md. 30)
- Yıllık ek kira tam yıllık hesaplanır (cari yıl kirası × katsayı ya da maliyetin %2’si, yüksek olan). Tebliğ gün/365 kıstlaştırma öngörmediğinden program kıst hesaplamaz; muhasebede kıst kaydı varsa fark olarak gösterir.
- Tahsil zamanı Md. 30/2’ye göre onayı izleyen ilk taksittir (son taksit geçmişse onay ayı sonu).

## Harita ve eksik veriler
- Park sınırları ve tesisler Leaflet ile gösterilir (`vendor/leaflet`, `vendor/proj4.js`). Koordinatlar ITRF96 TM 3° (EPSG:5254 vb.), ED50 TM 3°/UTM 6° (EPSG:1784 dönüşüm parametreleri) ya da WGS84 olarak yüklenebilir; sınırdan hesaplanan alan kayıttaki alanla karşılaştırılır.
- “Eksik veriler” sayfası park kaydındaki boş, belgede bulunamayan ve çelişkili alanları gösterir; girilen değer kaynağıyla birlikte park kaydına yazılır ve bütün sayfalara, eklere ve hesaplara yansır.
