# Orman Parkları Yönetim Sistemi

İstanbul Orman İşletme Müdürlüğü için orman parkları yönetim sistemi (313 sayılı Orman Parkları Tebliği).
Telefona ve bilgisayara uygulama olarak kurulabilir (PWA).

**Hazırlayan:** Süleyman Özyurt

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
- **Park seçimi:** sayfanın üstündeki “Orman parkı seç” kutusuna park adı yazılır ya da listeden seçilir; harita parka yaklaşır, sınır ve tesis katmanları açılır. “Tüm parklar” bütün parkları ve özet tabloyu gösterir (tesisler bu görünümde yakın ölçekte, 14+, çizilir). Seçim adres çubuğuna yazılır (`#/harita?p=Kayabaşı&t=<tesis kodu>`), “Paylaş” bu bağlantıyı verir; açan kişi yine erişim parolasıyla girer.
- **Plan katmanları:** `data/harita.enc` (şifreli) her park için plan sürümlerini (`planlar`: güncel onaylı / arşiv – önceki plan / onayı belgede görülmedi / bilgi katmanı), çizimleri, kaynak dosyaları, okuma notlarını, denetim sayılarını ve eksik belge listesini tutar. Arşiv planları varsayılan kapalıdır; “Plan ve revizyonlar” bölümünden tek tek açılır.
- **Tesis durumu:** mevcut / planlanan / önceki onaylı planda – inşa edilmemiş / onaylı vaziyet planında / kaldırılan / yol-otopark / bilgi alanı / belirtilmemiş. Durum, plan katman adlarından, plandaki M/T koordinat etiketlerinden ya da taralı mevcut yapı katmanlarından okunur; okunamayan “belirtilmemiş” kalır.
- **Bilgi kutusu:** park, tesis, plan kodu, durum, çizimden alan/uzunluk, plan adı ve onayı, WGS84 ve ITRF96 TM30 koordinat, son denetimle tür düzeyinde karşılaştırma, kaynak dosya; belgede olmayan bilgi “Belgede belirtilmemiş” yazılır. Düğmeler: yakınlaş, koordinat kopyala, belgeyi aç, paylaş, kapat.
- **Envanter:** yan paneldeki tablo süzgeçlerle (durum, tür, arama, arşiv) haritayla birlikte süzülür; satıra dokununca tesis açılır, açık tesis tabloda işaretlenir.
- **Araçlar:** altlık seçimi (uydu, standart, topoğrafik, yer adları), parka sığdır, tam ekran, mesafe ve alan ölçümü (alan ITRF96 TM30 düzleminde), konum, imleç koordinatı; KML, KMZ ve park başına KML (zip) indirme. KML’de her park klasöründe güncel sınır, diğer sınırlar ve plan klasörleri (her birinde durum klasörleri) bulunur; arşiv planları kapalı gelir.
- **Veri denetimi:** mükerrer çizimler birleştirilir; hatalı geometri, park sınırının 20 m’den fazla dışında kalan çizim, kayıt–harita alan farkı, park kaydındaki plan bilgisiyle çelişki ve eksik belgeler “Veri denetimi ve eksikler” bölümünde listelenir.
- **Güncelleme:** “Koordinat / KML yükle” penceresinde “Plan tesis katmanı (KML/KMZ)” seçilerek yeni plan ya da revizyon eklenir (veri düzenleme yetkisi); önceki çizimler silinmez, ayrı plan olarak durur.
- Sınır seçimi: kayıtlı alanla uyumlu ve en yeni onaylı belgeye dayanan çizim esas alınır; kayıtla uyuşmayan ya da onayı belirsiz çizimler “diğer sınır çizimleri” olarak kesikli gösterilir.

## Uygulama olarak kullanım (PWA)
- Telefon ve bilgisayarda “Ana ekrana ekle / Yükle” ile kurulur. Sayfa her açılışta ağdan gelir (yeni sürüm hemen yansır); program dosyaları ve son açılan veriler cihazda saklanır.
- Yeni sürüm yüklendiğinde altta “Yenile” bandı çıkar; yarım kalan iş kaybolmasın diye kendiliğinden yenilenmez.
- Çevrimdışında üstte uyarı çıkar: son açılan şifreli veriler ve plan katmanları görüntülenir, kayıt yapılamaz. Harita altlığı yalnız daha önce görüntülenen bölgelerde görünür (en çok 3.000 karo saklanır); tüm İstanbul’u önceden indirme yoktur.
- “Eksik veriler” sayfası park kaydındaki boş, belgede bulunamayan ve çelişkili alanları gösterir; girilen değer kaynağıyla birlikte park kaydına yazılır ve bütün sayfalara, eklere ve hesaplara yansır.
