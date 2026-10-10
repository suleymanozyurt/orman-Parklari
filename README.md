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
