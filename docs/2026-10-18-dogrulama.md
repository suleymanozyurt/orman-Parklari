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

Özel koordinatlar, KML ve ayrıntılı envanter açık kod deposuna eklenmez. Uygulamaya kayıt, mevcut şifreli veri kaydetme mekanizmasıyla yapılacaktır. Bu not tek başına üretime veri kaydedildiğinin veya yeniden okunduğunun kanıtı değildir; canlı kayıt sonucu ayrıca belirtilecektir.
