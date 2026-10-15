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


## v16 · son talimata göre ana çalışma alanları

Yedi ana menü: Genel Durum, Harita, Orman Parkları, Muhasebe, Tebliğ Ekleri, Kayıt Defteri, Tebliğ ve Hesaplar. Önceki adresler alt sayfa olarak korunur. Seçili parkın bağlantı parametresi gezinmede güncellenir. Muhasebe tablosu seçili parkla açılır; tüm kayıtlar ayrıca seçilebilir. Resmî işlem defteri ayrı sayfa ve CSV çıktısıdır. Mevcut veri veya hesaplama motoru bu düzenlemeyle değiştirilmez.

Koyu yüzeyler, yüksek kontrastlı metin, zümrüt vurgu ve altın etkin sekmeler tek bir UI stil dosyasında birleştirildi. Resmî form kâğıtları baskı amaçlı beyaz kalır; uygulama yüzeyleri ve harita bilgi kutuları koyu tasarıma uyar. Ekran görüntüsü ve canlı arayüz kontrolleri ayrıca kaydedilecektir.

Kaynak incelemesi park detayında ve harita panelinde görünür. Belge onay durumu, inceleme güveni, planda mevcut/planlanan/işlevi değiştirilen durumları ve saha/konum teyidi ayrı alanlardır. Koordinatı olmayan cetvel satırları geometri veya doğrulanmış tesis sayısı üretmez. Kaynak incelemesi güncellenirken önceki inceleme arşivlenir; finans ve sınırlar değiştirilmez. Yönetici tarafından kontrol ve uygulama adımı gerekir.

Güncel test sonucu: 48 JavaScript + 6 Python = 54 başarılı test. Yeni testler: tam yedi menü, eski rota sahipliği, seçili park bağlantılarının güncellenmesi, defterin bağımsız görüntülenmesi/dışa aktarımı, kaynak doğrulaması, tehlikeli URL/yanlış park/eksik belge/geçersiz ölçü reddi, izinsiz kaynak düzenlemesinin engellenmesi, önceki incelemenin korunması, geometri ve saha kesinliği üretilememesi, seçili park/tüm muhasebe kayıtları ayrımı.

### Güncellenen canlı kaynak sonucu

15.10.2026 TSİ 10:43 denemesinde TÜİK veri portalına erişildi ve seri 21 bilinen ayla doğrulandı. Eylül 2026 son verisi korundu, açıklanmamış aylara oran yazılmadı. Resmî Gazete 7/7 günlük taraması tamamlandı. Bu sonuç kaynak kontrol kaydıdır; geçmiş belgelerin veya bütün mali hesaplamaların hukuki doğrulaması değildir.

## v17 · canlı gezinme testi ve kaynak kaydı

Canlı sitede harita üzerinden Kurtyolu → Kayabaşı seçimi yapıldığında sol menü bağlantılarının önceki parkı koruduğu gözlendi. Harita seçimi artık sol park seçicisini ve bütün ana menü bağlantılarını birlikte günceller. Sol panelden yapılan park değişikliği de ilgili sayfanın park parametresini değiştirir; harita eski URL'deki parkı yeniden seçmez. Muhasebe ve tahakkuk bağlantıları seçili parkı taşır. Genel sayfadaki Tebliğ Ekleri kartının eski birleşik adı düzeltildi.

Yeni iki test gerçek hata senaryolarını kapsar: haritadan park değiştirip muhasebeye geçiş ve sol panelden seçilen parkın eski harita parametresiyle geri alınmaması. Sonuç: 50 JavaScript ve 6 Python testi başarılı (56 toplam).

Kurtyolu kaynak incelemesi uygulamanın standart şifreli kayıt akışıyla kaydedildi; canlı arayüzde “Kaydedildi” ve sunucu eşitlemesi doğrulandı. Kaynak taramanın 83–84. sayfalarından 50 cetvel satırı kaydedildi: 19 planlanan, 27 çizimde mevcut, 4 işlevi değiştirilen satır. Bunlar benzersiz tesis veya doğrulanmış konum sayısı değildir. 4. revize tarama ile park kaydındaki 14.04.2023 tarihli 5. revize plan ayrıldı. Sayısal NCZ ve talep KMZ kaynağı bulundu; onay/sürüm bağı doğrulanmadığından harita sınırı veya tesis geometrisi değiştirilmedi. Üç kaynak ve beş teyit konusu park detayında ve haritada görünür.

Yeni 109 sayfalık taramanın metin indeksi çıkarıldı. Kurtyolu cetveli görsel olarak incelendi; bütün 109 sayfanın resmî onay ve tesis doğrulaması tamamlanmış sayılmıyor. 100–109. sayfalar önceki Tayakadın sayfalarının tekrarını içeriyor; arşiv indeksi Kağıthane kapsamıyla çeliştiğinden belge içeriğinin yerine esas alınmadı.
