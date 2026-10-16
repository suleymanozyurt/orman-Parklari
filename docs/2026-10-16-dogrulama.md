# 16.10.2026 – v19 doğrulama

## Uygulanan
- Haritadaki tarayıcı datalist seçicisi erişilebilir arama ve açılır listeyle değiştirildi. Seçili park adı tekrar açılışta filtre olarak kullanılmıyor. Bütün parklar her açılışta seçilebilir. Arama, Türkçe karakter normalleştirme, doğrudan ardışık seçim, klavye okları/Enter/Escape ve odağı kaybetmede iptal destekleniyor.
- Koyu yeşil yüzeyler grafit ve laciverte dönüştürüldü. Turkuaz eylemler, altın seçili sekmeler ve durum renkleri ayrıldı. Yazdırma şablonlarının beyaz kâğıdı korundu.
- Kullanıcının son yüklediği ORMAN PARKLARI VAR-YOK TABLOLARI(1).xlsx dosyasının dokuz sayfası ve 90 belge kalemi kaynak XML içeriğinden kontrol edildi. Önceki 90 kalemin adları ve sabit kimlikleri birebir aynı. Önceden aktarılmayan dört gönderim notu tamamlandı. Dosya SHA-256, sayfa adı ve kaynak hücreler eklendi. Mevcut park bazındaki kontroller korunuyor. Şablondaki boş H/I hücreleri Var veya Yok olarak yorumlanmadı.

## Gerçekleştirilen testler
- JavaScript: 55 test geçti, 0 hata. Bunlara ardışık park seçimi, listenin yeniden tam açılması, Türkçe arama, boş sonuç, Escape ile iptal, klavye seçimi ve VAR-YOK kaynak/kayıt kontrolleri dahil.
- Python: 6 test geçti.
- node --check ve git diff --check başarılı.
- Hesaplama motoru ve şifreli veri dosyaları bu değişiklik kapsamında değiştirilmedi.

## Sınırlar
Bu testler bütün uygulamanın her cihazda hatasız olduğuna dair iddia değildir. Fiziksel iOS/Android cihaz ve tüm harita altlıklarının çevrimdışı kapsamı yeniden test edilmedi. Yeni EK-10 Denetim Raporları(5).xlsm ayrı incelenmektedir; v19 veri aktarımı içermez.

## Canlı site kontrolleri (16.10.2026)
- Yayın commit: 630667cfadef295eaf2403960f1371ff8efa23be. Uygulama kontrolleri ve GitHub Pages yayını başarılı.
- Güvenli erişimle canlı sitede 17 parkın tamamı, Tüm parklar düğmesine basılmadan art arda seçildi. Her seçimde sonuç başlığı doğru parkı gösterdi.
- Kurtyolu → Kayabaşı → Göktürk geçişlerinde liste yeniden açıldığında 17 seçenek vardı. Göktürk seçiliyken Muhasebe sayfası Göktürk dökümüne geçti.
- Canlı VAR–YOK ekranında dokuz işlem türünün kalem sayıları 8,10,12,14,14,11,7,7,7; toplam 90. Dokuzunun da gönderim notu göründü.
- Yedi ana modülün içerikleri açıldı. Tebliğ sayfasında ilk hızlı okumada önceki menü durumu görüldüğü için yeniden kontrol edildi; sonuç başlığı, madde içerikleri ve etkin menü teblig olarak doğrulandı.
- Koyu lacivert/grafit görünüm ve haritadaki açık park listesi ekran görüntüsüyle gözden geçirildi. Bu, fiziksel mobil cihaz testi değildir.

## Yeni Ek-10 kaynağının karşılaştırılması
EK-10 Denetim Raporları(5).xlsm makroları çalıştırılmadan XML içerikleri okundu. 14 raporun uygulamada kullanılan 15 denetim alanı, önceki veri yedeğiyle karşılaştırıldı; 210 alan eşleşti. Karşılaştırma canlı veritabanının tamamının birebir doğrulandığı anlamına gelmez. Mükerrer rapor eklenmedi, mali alanlar veya güncel sınırlar bu dosyayla değiştirilmedi. Kurtyolu için içindekilerdeki 2,77 ha değeri ve İmrahor genel kanaatindeki sınır değişikliği tarihi gibi kaynak çelişkileri resmî onay üzerinden teyit edilmelidir.

## v20 – Gecikme zammı motorunun dayanakla düzeltilmesi
GİB Tahsilat Genel Tebliği Seri A/1 (01.10.2024 tarihli konsolide PDF), Gecikme Zammı bölümünde: tam ay içinde değişen oranın tam ayı bölmemesi, günlük kalan sürenin yürürlük gününde bölünmesi, günlük katsayının altı ondalığa yukarı tamamlanması, ay sonu vadelerinin ay sonunda korunması ve 30 günlük kesrin aylık hesaplanması kontrol edildi. Resmî PDF: https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv/fileadmin/mevzuatek/eski/Tahsilat_Genel_Tebligi_A1_01102024_1.pdf . Oran değişim açıklaması: https://gib.gov.tr/mevzuat/kanun/442/teblig/10351 . Güncel oran tablosu: https://cdn.gib.gov.tr/api/gibportal-file/file/getFileResources?objectKey=arsiv/yardim-kaynaklar/yararli-bilgiler/gecikme-zammi-orani.pdf .

Önceki motor oran değişiminde ay hesabını yeniden başlatıyor ve günlük katsayıyı yuvarlamadan kullanıyordu. Yeni motor vade dönemlerini koruyor, günlük kesri ayrı hesaplıyor. Eksik tarihsel oran artık sıfır gecikme gibi hesaplanmıyor; sonuç hesaplanamaz olarak kalıyor. Alacak ayrıntısı ve hesap aracı açıklamaları aynı yönteme göre güncellendi.

GİB sayısal örnekleri bağımsız sabit beklenen sonuçlarla test edildi: 20,28 TL; 32.000,50 TL; 541,70 TL; 21,68 TL; 187,55 TL; 30 günlük kesirde 25,00 / 125,00 TL. Artık yıl, ay sonu ve oran başlangıç günü sınırları ayrıca test edildi. 62 JavaScript + 6 Python testi başarılı. Bu testler, tüm parkların sözleşme/vergi rejiminin veya resmî muhasebe dökümünün idari teyidi değildir.

Önceki veri yedeğinde aynı oran/döküm ve 16.10.2026 hesap tarihiyle 103 parça karşılaştırıldı: 69 GZ sonucu değişti, eksik oran kapsamı yok. Açık ana para her iki hesapta 17.762.958,87 TL. GZ+KDV toplamı eski yöntemde 1.692.246,92 TL, düzeltilen yöntemde 1.695.518,44 TL. Bu fark yeni tahakkuk veya güncel borç belgesi değildir. Şifreli kaynak kayıtlar değiştirilmedi.

Devam eden kontroller: park/sözleşme bazında kira dönemi dayanakları, muhasebe dökümünün güncel kapsamı, ek tesis onayları, tüm kaynakların harita eşleştirmesi ve asgari GZ gibi kalem/ödeme bazında ayrıca değerlendirilmesi gereken özel hükümler. Tam mevzuat uygunluğu henüz ilan edilmez.

## v21 – Saha konum takibi
Tek seferlik konum sorgusu, kullanıcı başlattığında devamlı watchPosition takibine dönüştürüldü. Konum işareti ve doğruluk çemberi güncellenir; konum zamanı, düşük hassasiyet ve 30 saniyeden eski sinyal gösterilir. Harita elle sürüklendiğinde takip kamerası serbest kalır; Konuma dön ile yeniden izlenebilir. Durdurma, izin reddi ve sayfadan ayrılmada takip temizlenir; geç gelen callback haritayı değiştiremez. Konum uygulama tarafından sunucuya kaydedilmez.

63 JavaScript testi başarılı. GPS testi sahte cihaz callback'leriyle güncelleme/çember/takip durdurma/eski konum/izin reddi senaryolarını gerçekten çalıştırır; gerçek arazi GPS ölçümü değildir.
