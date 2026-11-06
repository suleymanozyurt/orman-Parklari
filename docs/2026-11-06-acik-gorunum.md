# Açık görünüm — v42

6 Kasım 2026

- Tek açık tema: giriş, menü, kartlar, park özeti, harita kontrolleri, mobil çubuklar ve PWA başlangıç renkleri.
- Eski koyu / cihaz teması kayıtları açılışta açık görünüme taşınır. Depolama engellense de açık tema uygulanır.
- Beş ana modül ve mevcut alt sayfalar korunur; ayrıntılar açılır bölümlerde kalır.
- Hesap motoru, kaynak kayıtlar, belgeler, kullanıcılar ve coğrafi veriler değiştirilmedi.
- Yazdırılan kira dökümünde yılbaşı çalışma hesabı açıkça karşılaştırma taslağı olarak işaretlendi. Kesin yasal tahakkuk ifadesi kaldırıldı. Döküm ve kaynaklar sözleşme / yetkili onay kontrolünün yerine geçmez.

## Mevzuat kontrolü

OGM'nin yayımladığı [313 sayılı Orman Parkları Tebliği](https://www.ogm.gov.tr/tr/e-kutuphane-sitesi/mevzuat-sitesi/Tebligler/313%20Say%C4%B1l%C4%B1%20Orman%20Parklar%C4%B1%20Tebli%C4%9Fi.pdf), Md. 31–33 incelendi. Md. 32 sözleşme ayındaki on iki aylık ortalamalara göre TÜFE artışını düzenler. Kullanıcının yılbaşında hazırlama iş akışı bu yasal esasla aynı şey olarak sunulmaz. Eski sözleşme, revizyon ve kıst dayanakları park bazında ayrıca değerlendirilmelidir. Bu sürüm bütün sözleşmelerin hukuki denetiminin tamamlandığı iddiasını içermez.

## Doğrulama

- 119 JavaScript testi geçti: hesaplamalar, geometri, gezinme, yetkilendirme, veri yenileme ve service worker.
- 6 Python testi geçti.
- Yeni testler: eski tema kaydının dönüşümü, depolama engeli, eski tema eylemleri, taslak ile yasal hesabın ayrımı ve dökümün veri değiştirmemesi.
- JavaScript söz dizimi ve git diff boşluk kontrolü başarılı.
