# 18.10.2026 — KML durum koruması ve kaynak geometri denetimi

## v25 değişikliği

KML dışa aktarımı artık sekiz plan durumunu `op_status` alanında saklar. Yeniden yüklemede geçerli açık durum ve tesis türü korunur; eski dosyalarda klasör adına göre mevcut çözümleme sürer. Özellikle önceki onaylı planda yapılmamış tesisler yeniden yüklemede mevcut tesise dönüşmez. Açıkça belirtilmiş plan durumu, alanın park alanına oranıyla değiştirilmez. Bu alan bir belgenin onayını veya güncelliğini kanıtlamaz.

## Uygulanan kontroller

- `npm test`: 67 test geçti, başarısız test yok. Sekiz durumun ve tesis türlerinin KML gidiş-dönüş denetimi eklendi. Finans, park seçici, geometri, senkronizasyon ve PWA testleri de bu çalıştırmaya dahildir.
- `node --check js/app.js` ve `git diff --check`: başarılı.
- Çiçekçiler III. revizyon kaynak KML'si gerçek uygulama okuyucusuyla çalıştırıldı: 122 unsur; 49 nokta, 67 poligon, 6 çizgi. Durumlar: M49, P21, O45, Y6, A1. Geometri doğrulama hatası yok. Noktalar yapı oturumu olarak gösterilmedi.
- Kaynak NCZ'deki 115 tesis noktası aynı çizimin 115 koordinat cetveli satırıyla eşleşti. En büyük fark 0,000496 m, cetvelin sayısal yuvarlama hassasiyetidir; saha ölçü doğruluğu değildir.
- NCZ okuyucu, daha önce bağımsız çıkarılmış Hacı Bektaş-i Veli verisinin 150 köşesiyle ayrıca karşılaştırıldı; sayısal fark sıfır.
- Kaynak 25 köşeli plan poligonu geçerli ve yaklaşık 9,741104 ha. Belgedeki 9,50 ha ile fark nedeniyle esas park sınırı değiştirilmek üzere hazırlanmadı; bilgi katmanıdır.
- İki planlanan tesisin paintball poligonu içinde olması, çocuk oyun alanının lejant/rapor/çizim alan farkı ve kaynak güncelliği ayrı teyit konularıdır. Geometriler bu farkları gizlemek için değiştirilmedi.

## Kapsam ve veri güvenliği

Çiçekçiler için dört kaynak, imzalı taramanın ilgili sayfaları ve sayısal çizim incelendi. Bu çalışma 115 tesis referansını kapsar; 122 coğrafi unsurun tamamı tesis değildir. Bütün parkların veya bu parkın bütün altyapı ve mevcut tesis oturumlarının incelemesi bitmiş sayılmaz. Güncel saha mevcudiyeti ve sonraki onay zinciri ayrıca doğrulanmalıdır.

Özel koordinatlar, KML ve ayrıntılı envanter açık kod deposuna eklenmez. Uygulamaya kayıt, mevcut şifreli veri kaydetme mekanizmasıyla yapıldı. Canlı kayıt ve yeniden okuma sonuçları aşağıdadır.

## Canlı kayıt ve yeniden okuma

v25 uygulama kontrolleri ve Pages yayını başarılı. Çiçekçiler katmanı uygulamanın normal yönetici arayüzünden şifreli kaydedildi; dört kaynak ve yedi teyit konusu ayrıca eklendi. `Verileri yenile` işlemi sunucudaki sürümü aldıktan sonra 122 unsur ve kaynak incelemesi tekrar görüldü. Resmî alan 9,50 ha, esas harita alanı 9,49 ha ve güncel sözleşme tarihleri korundu.

Uygulamadan gerçek KML indirildi: esas sınır dahil 123 Placemark; 68 poligon, 49 nokta, 6 çizgi. Plan katmanındaki 122 geometrinin koordinatları hazırlanan kaynak KML ile tek tek birebir aynı. M49/P21/O45/Y6/A1 durumları dışa aktarımda da korundu. Bu sonuç, mevcut tesis oturumları veya imzalı cetvelin bütün satırlarının ayrıca teyidinin tamamlandığı anlamına gelmez.

## v26 — bilgi kutusundaki anlam doğruluğu

Canlı kontrol sırasında `Kaynak katman` alanının genel `kat` araması yüzünden yükseklik gibi gösterilebildiği görüldü. Yükseklik artık gerçek kat/yükseklik/hmax etiketlerinden okunur. Park genelindeki denetim tür eşleşmesi tek tesisin sahadaki mevcudiyeti olarak sunulmaz; birebir eşleştirme yapılmadığı açıkça yazılır. Kaynak ölçü/geometri çelişkileri açılır ayrıntılara girmeden görünür. KML önizleme açıklaması açık kayıtlı durumun önceliğini anlatacak şekilde güncellendi.

`npm test`: 69/69 başarılı; iki yeni test bu bilgi kutusu hatalarını ve kaynak uyarısının görünür/kaçışlanmış gösterimini denetler. Sözdizimi ve diff kontrolleri başarılı. Fiziksel cihazda saha GPS testi, gerçek PWA kurulum testi ve bütün parkların kaynak incelemesi tamamlanmış sayılmaz.

v26 canlı sayfada açıldı: 122 unsur korunuyor; Y19 uyarısı açılır ayrıntılardan önce görünür. Y19 yüksekliği `Belgede belirtilmemiş`, Y3 hmax değeri 6,5; denetim tür eşleşmesi birebir tesis tespiti olarak sunulmuyor. Kaynak yol çizgisi uzunluğu ve mevcut sınırla uyuşmazlık uyarısı da kontrol edildi. Tam ekran ve parka sığdır düğmeleri çalıştırıldı.

## v27 — okunabilirlik ve bilgiye erişim

Koyu harita bilgi kutularındaki sabit koyu yeşil başlık rengi tema metin rengiyle değiştirildi; tablo çizgileri, kaynak bağlantıları ve uyarılar da temaya uyar. Baskı stilleri değişmez. Uzun kaynak incelemesi belge/teyit konusu sayısını gösteren açılır bölümde tutulur; düzenleme düğmesi ve inceleme durumu doğrudan erişilebilir. Bu değişiklik hiçbir kaydı veya planı değiştirmez.

`npm test`: 70/70 başarılı; yeni test açılır bölümde bütün kaynakların korunmasını ve düzenleme düğmesinin erişilebilirliğini denetler. Sözdizimi ve diff kontrolleri başarılı.

v27 uygulama kontrolü ve Pages yayını başarılı; canlı sayfada `app.js?v=27` görüldü. Yeniden girişten sonra Çiçekçiler 122 unsurla açıldı. Belge bölümü başlangıçta kapalı, açılınca dört kaynak ve yedi teyit konusu erişilebilir. Kurtyolu → Hacı Bektaş-i Veli → Çiçekçiler geçişleri “Tüm parklar” adımı olmadan yapıldı; harita seçicisinde 17 seçenek bulundu. Canlı hesaplanmış renklerden metin kontrastı başlıklarda 10,50:1, kaynak uyarısında 8,18:1; her ikisi de 4,5:1 kontrolünü geçti. Gerçek harita ve kaynak uyarılı bilgi kutusu ekran görüntüsü özel çalışma çıktısı olarak kaydedildi.
