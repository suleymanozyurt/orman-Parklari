# 11.11.2026 — v44, arayüz ve kaynak kontrolü

## Uygulanan

- Açık görünüm korundu; yan panel daraltıldı, önceki/sonraki park düğmeleri yerine seçili park dosyasına doğrudan bağlantı kondu. Haritada ikinci park seçicisi gizlendi. Katman paneli başlangıçta kapalı; ayrıntılı alacak özeti açılır bölümde.
- Önceki v43'ün ayrı ziyaret kimliği, kaynak anlık görüntüsü, şifreli yerel Ek-10 kurtarma ve muhasebe kaynak düzeltmeleri bu sürüme alındı. Sonraki resmî oran ve yönetici kayıtları korunarak güncel main üzerinden çalışıldı.
- Drive'dan tekrar alınan üç Ekim muhasebe dosyasının SHA-256 değerleri önceki aktarım kaynaklarıyla birebir aynı. 296 mali hareket yeniden eklenmedi; tutar, vade, tahsilat ve geometri değiştirilmedi. Dosya karşılaştırma tarihi ile son muhasebe yevmiyesi ayrı tutuldu. Ana kaynak açıklamasının eski Eylül kapsamı düzeltilerek gerçek Ekim kaynakları yazıldı.
- Güncel Drive ana KMZ'si alındı: 18 Placemark. Aynı kayıtta sınır ve merkez noktası bulunabildiği için nesne sayısından yeni park sayısı üretilmedi. Güncel teslim veya plan sınırları bu genel katmanla ezilmedi.
- Göktürk vaziyet planının 4. sayfasında T1–T20 isimleri ve 30°/3° ham Y/X değerleri görüntüyle kontrol edilerek 20 referans satırı kaynak inceleme cetveline eklendi. Son onay tarihi ile 28.07.2011 teknik inceleme tarihi karıştırılmadı. Datum ve güncellik teyidi gerektiğinden WGS84 tesis konumu üretilmedi.
- Azizpaşa koordinat cetveli içeren taranmış kaynak bulundu. OCR eksikleri, özgün CRS ve güncel onay gereksinimi kayda işlendi. Kurtyolu'nun yeniden bulunan 4. revizyonu, daha yeni 5. revizyonun veya 2025 teslim sınırının yerine geçirilmedi; 5. revizyonun imzalı ve sayısal taslak nüshaları tekrar alındı.
- Yeni sürümden sonraki bu-tarayıcı giriş/çıkış olayları için RSA-OAEP + AES-GCM ile şifreli yerel kayıt eklendi. Özel açma anahtarı mevcut yönetici kaydının içinde, yönetici parolasıyla şifreli. Normal kullanıcı arayüzü bu geçmişi sunmaz; görüntüleme parolası veya açık şifreleme anahtarı olayların içeriğini açamaz.
- Yönetici parolası değiştirme akışında kullanıcı dizini ve erişim günlüğü anahtarları korunur. Erişim/yönetici parolaları ve mevcut yazma anahtarı bu geliştirme sırasında değiştirilmedi.

## Gerçek kapsam ve açık işler

- 17 kayıtlı park ve 2.658 mevcut coğrafi unsur bulunur. Coğrafi unsur sayısı, sahada mevcut ve benzersiz tesis sayısı değildir. Bu sürümde yeni doğrulanmış geometri eklenmedi. Koordinatsız veya datumu teyitsiz tesisler haritaya tahminle konmadı.
- Göktürk için son geçerli planın datum/CRS açıklaması ve/veya sayısal özgün dosya; Azizpaşa için okunaklı cetvel, datum ve güncel onay teyidi gerekli. Kurtyolu'nda imzalı paftayla sayısal taslak arasındaki A10 farkı ve diğer eşleştirmeler açık.
- Giriş geçmişi yalnız aynı tarayıcıda tutulan son 200 şifreli olayı kapsar. Önceki girişleri veya başka cihazların girişlerini göstermez. Başarısız giriş, sunucu saati, IP ve şehir toplanmaz. Ortak görüntüleme parolası kişi kimliği kanıtlamaz. Bütün cihazları kapsayan yöneticiye özel günlük için sunucuda kimlik doğrulayan merkezî kayıt hizmeti gerekir; bu hizmet bağlı değildir.
- Drive dosyaları bu çalışma sırasında gerçek bağlantıyla karşılaştırıldı. Sitenin kapalıyken bütün özel Drive arşivini sürekli izlemesi kurulmuş değildir. Mevcut resmî oran iş akışı ve açık sekme kaynak eşitlemesi korunur.
- Yönetici parolasını unutarak sıfırdan kurulum yapılması, eski yerel günlüklerin özel açma anahtarını kurtarmaz. Normal parola değiştirme akışı anahtarı korur. Tarayıcı depolaması silinirse bu cihazdaki yerel olaylar kaybolur; bunlar kurumsal merkezî denetim kaydı değildir.

## Doğrulama

- 132 JavaScript testi: hesap, yılbaşı/kıst, geometri, seçim, kaynak sürümü, senkronizasyon, form, şifreli kayıt ve service worker senaryoları başarılı.
- 6 Python oran testi başarılı.
- Yeni şifreli veri yeniden açılarak birebir karşılaştırıldı; önceki muhasebe hareketleri korundu.
- Güncel veriyle hazırlanan yalıtılmış geliştirme görünümünde masaüstü Genel Durum ve harita incelendi. Tayakadın → Göktürk → Kurtyolu seçimi, Tüm Parklar'a dönmeden denendi; seçili park başlığı ve sınırı değişti. Üretim kimlik doğrulaması geliştirme için değiştirilmedi.
- Canlı yayın sonucu ve varsa ek tarayıcı kontrolleri aşağıdaki teslim kaydına eklenir; yerel test, canlıda oturum açıldığı veya bütün kaynakların doğrulandığı anlamına gelmez.

## Sonraki öncelikler

1. Önce özgün CRS'li ve onay sürümü eşleştirilmiş tesis dosyalarıyla eksik geometrileri tamamlamak.
2. Sunucuda kullanıcı doğrulayan, kayıtları yalnız yöneticiye açan merkezî giriş hizmeti kurmak.
3. Özel Drive kaynaklarını erişim yetkilerini koruyarak artımlı alan bir arka plan bağlantısı kurmak; dosyanın yüklenme tarihi yerine içeriği ve hukuki sürümüyle ilerlemek.
