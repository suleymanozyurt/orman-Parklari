# 15 Ekim 2026 geliştirme doğrulaması

## Uygulanan değişiklikler

- v13: Orman Parkları Yönetim Sistemi adı, orman/yol logosu, uygulama ikonları ve sol altta sabit hazırlayan bilgisi. Görünümde müdürlük alt başlığı kaldırıldı.
- v14: iş sırasına göre menü grupları, harita/park envanteri/Tebliğ ekleri/tahakkuk hızlı erişimi, seçili parkın ilgili sayfalarına doğrudan bağlantılar ve tema tutarlılığı.
- Yıl seçenekleri kayıtlı sözleşme başlangıç/bitiş tarihlerinden üretilir. Yeni parkın daha ileri bitiş yılı eklenince aralık genişler. Gelecekteki oran uydurulmaz; eksik TÜFE tamamlandığında yıl hesabı yeniden yapılır.
- Manuel yenileme önce kaynak sürümünü doğrular, aynı sürümün kayıt ve oran dosyalarını indirir. Harita, form ve belge belleği temizlenir. İndirme hatası, çevrimdışı durum, bozuk veri ve indirme sırasında başlayan düzenleme mevcut kaydın üzerine yazmaz.
- Arka plan denetimi yalnız park verisini değil, oran dosyasını da izler. Resmî oran değiştiğinde hesaplar yeniden oluşturulur.
- Resmî kaynak denetimi günde beş zaman aralığına ayarlandı. Deneme ve başarılı kontrol tarihleri ayrıldı. Kısmi/başarısız Resmî Gazete taraması başarılı gibi gösterilmez. Kararın yayım tarihinde yürürlüğe girdiği doğrulanamazsa yeni GZ oranı otomatik işlenmez.

## Çalıştırılan otomatik testler

`npm test`: 42 başarılı JavaScript testi.

`python3 -m unittest discover -s tests -p '*_test.py'`: 6 başarılı kaynak güncelleme testi.

Önemli senaryolar: sözleşme son yılına erişim; yeni parkla yıl aralığının genişlemesi; eksik gelecek TÜFE için boş tutar; oranlar geldikten sonra bağımsız kuruş hesabıyla sonuç kontrolü; aynı sürümden gerçek indirme akışı; oran dosyası değiştiğinde yeniden hesaplama; çevrimdışı/bozuk veri/indirme hatası; indirme sırasında başlayan taslağın korunması; yanlış TÜFE serisinin reddi; gelecek ay ve geçersiz sayının reddi; kısmi RG taraması; yürürlük tarihi teyidi; Word paragraf/tablo düzenlemesi; yeni park oluşturma; çakışma koruması; geometri, KML, katman ve PWA önbellek testleri.

## Kapsam sınırları

Otomatik kaynak testleri kontrollü yanıtlar kullanır; tek başına canlı resmî servise erişildiğini kanıtlamaz. Canlı güncelleme işi ve uygulama ayrıca kontrol edilmelidir. Mobil fiziksel cihaz kurulumu bütün iPhone/Android sürümlerinde sınanmış değildir. Tüm PDF sayfalarının hukuki/teknik doğrulaması ve bütün tesislerin saha mevcudiyetinin teyidi tamamlanmış sayılmaz. Çevrimiçi yapay zekâ servisi henüz bağlı değildir.

## Canlı kaynak kontrolü

15.10.2026 TSİ 10:37 çalışması tamamlandı. Resmî Gazete 7/7 günlük fihriste erişti. TÜİK veri servisi adres çözümleme hatası verdi; Eylül 2026 dahil mevcut tablo korunarak hata duruma yazıldı. Başarısız bağlantı yeni oran alınmış gibi gösterilmedi. Geçici taşıma hataları için sınırlı yeniden deneme eklendi. Kaynak güncellemesinin iş olarak tamamlanması, bütün dış kaynakların başarılı olduğu anlamına gelmez.

v15: uygulama sürüm denetimi açılışta ve görünürken iki dakikalık aralıklarla yapılır; kullanıcının taslağı varken zorla yenilenmez. Kesin TÜİK yayım tarihi olarak hesaplanan ayın 3'ü gösterilmez; açıklanmamış veri için bekleniyor ifadesi kullanılır.
