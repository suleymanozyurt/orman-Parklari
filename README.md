# Orman Parkları — kira, alacak ve denetim takibi

İstanbul Orman İşletme Müdürlüğü, Emlak Şefliği için orman parkı kira takip uygulaması (313 sayılı Orman Parkları Tebliği).
Telefona ve bilgisayara uygulama olarak kurulabilir (PWA).

**Adres:** https://suleymanozyurt.github.io/orman-Parklari/

## Nasıl çalışır
- **Veriler şifrelidir.** `data/veri.enc` ve `data/teblig.enc` AES-256-GCM ile şifrelenmiştir; erişim parolasını bilmeyen içeriği göremez. Depo herkese açık olsa da kayıtlar okunamaz.
- **Görüntüleme:** Linki ve erişim parolasını alan herkes bilgisayarda ve telefonda açar, yalnız görür.
- **Düzenleme:** Yalnız depo sahibi, bu depoya yazma izni olan GitHub anahtarıyla “Yönetici girişi” yaparak değişiklik yapar ve kaydeder.
- **Hesaplar** tarayıcıda yapılır (`js/engine.js`): muhasebe dökümü eşleştirmesi, gecikme zammı (6183 s.K. m.51; Tebliğ Md. 39/1), kira zinciri (Md. 31–32), ek tesis kirası (Md. 30), teminatlar (Md. 8–10).
- **Rapor tarihi** her gün kendiliğinden bugündür.
- **Resmî oranlar** (`data/oranlar.json`, şifresiz) her gün `.github/workflows/oranlar.yml` ile güncellenir:
  - Gecikme zammı: Resmî Gazete günlük fihristi taranır.
  - TÜFE (on iki aylık ortalamalara göre): TÜİK veri servisi; `TUIK_API_KEY` gizli anahtarı gerekir.
