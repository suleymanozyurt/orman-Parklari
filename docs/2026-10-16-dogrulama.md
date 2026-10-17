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

## v22 – Sınır kaynaklarının karışmasını önleme
Sınır yükleme aracına kaynak belge URL'si, belgedeki onay tarihi ve sınırın kapsamı (plan tasdik sınırı / hukuki park sınırı / teyit gerekli) eklendi. Önceki sınır ve kendi kaynağı arşivlenir. Yeni kayda önceki sınırın URL veya onay bilgisi miras kalmaz. Geriye dönük kayıtlar korunur. Gerçek davranış testiyle kaynak değişiminde eski URL/onayın temizlendiği ve arşivde korunduğu doğrulandı. 64 JavaScript testi geçti.

Hacı Bektaş-i Veli araştırması: imzalı tarama s.43 ile sayısal özgün PDF'deki 82 koordinat karşılaştırıldı; M15, M19, T9, T10, T34, T43 aktarım değerleri düzeltildi. Eski 82 nokta arşivde, düzeltilen 82 nokta esas plan gösteriminde; kayıt canlı siteye kaydedildi. Referans noktaları tesis oturum geometrisi olarak sunulmaz.

SADE klasöründeki KOORLIST.CKS'nin 150 köşesi, ED50_6 NCZ içindeki sayısal değerlerle 150/150 eşleşti. Aynı projenin WGS84_6 NCZ dosyasında eşlenik köşeler (tekrarlı kayıt kontrolü 0,001 m altında) bulundu. Kaynağın WGS84 UTM35N değerleri coğrafi WGS84'e dönüştürüldü. Poligon geçerli, kendini kesmiyor; düzeltilen 82 referans noktası içeride. Hesaplanan alanlar kaynak ED50 düzleminde 77,484211 ha, WGS84 UTM35N'de 77,483245 ha, ITRF96 TM30'da 77,511846 ha, jeodezik 77,495977 ha. Plan lejantı 77,48 ha, park kayıt alanı 77,47 ha; değerler aynı diye zorlanmadı. Bu 2020 plan tasdik sınırıdır; güncel hukuki sınır araştırması ayrı sürer.

PDF vektörlerinden oturum/çizgi çıkarmada ilk coğrafi eşleştirme denemesinde yaklaşık 4,2 m RMSE bulundu; yeterli görülmedi ve bu denemeden tesis poligonu yayımlanmadı. Sayısal çizim veya yeterli doğrulukta kaynak eşleştirmesi olmadan oturum alanı uydurulmaz.


## 17.10.2026 — v22 yayın ve v23 geometri düzeltmesi

- v22 GitHub yayını 7e8b9c530f1d4b632f853efd14c8cc226425b849; uygulama kontrolleri ve Pages başarılı. Canlı tarayıcıdaki kaynaklar v22 olarak görüldü.
- Tesis KML/KMZ yüklemesi artık Tesis seçeneğinde de plan aktarımıyla aynı geometri yolunu kullanıyor. Poligon veya çizgiden ortalama nokta üretme kaldırıldı. Elle girilen gerçek nokta listesi desteklenmeye devam eder.
- Her çizginin ve alanın bütün köşeleri İstanbul aralığında denetleniyor; yalnız ilk köşeye bakılmıyor.
- Kaynak bağlantısı ve belgedeki onay tarihi plan katmanına kaydediliyor; bir tarih girmek kendiliğinden güncel/onaylı plan statüsü vermiyor.
- Eski sınırın onay tarihi, sayısı ve koordinat cetveli bağlantısı arşivleniyor; yeni sınır bu eski bilgileri devralmıyor. Sınırın belge kapsamı park panelinde görünür.
- Gerçek yükleme penceresiyle otomatik test: Tesis ve Plan seçeneğinin ikisinde de aynı KML içindeki 1 delikli poligon, 1 çizgi, 1 nokta korunarak önizlendi; ilk noktası doğru, sonraki noktası İstanbul dışındaki çizgi kaydı engellendi.
- Hacı Bektaş-i Veli 150 köşeli 2020 plan sınırının canlı kaydı bu notun yazıldığı anda henüz tamamlanmadı. Oturum yenilendiğinde veri aktarımı ve yeniden okuma ayrıca doğrulanacak.


## 17.10.2026 — canlı kayıt ve dışa aktarım doğrulaması

- v23 yayını b95cd812b0ff88b27e715df5cca25bc707d36b55; uygulama kontrolleri ve Pages başarılı. Canlı tarayıcı kaynak dosyası js/app.js?v=23 olarak doğrulandı.
- Son kontroller: 65 JavaScript testi başarılı; bu oturum başında 6 Python testi başarılı. JavaScript sözdizimi ve git diff boşluk kontrolü başarılı.
- Hacı Bektaş-i Veli: 150 benzersiz köşeli 2020 plan tasdik sınırı gerçek yönetici arayüzünden yüklendi. Kaynak, 10.04.2020 belge tarihi ve plan tasdik kapsamı kaydedildi. Eski 71,63 ha sınır kaynağıyla arşivlendi; önceki sınır sayısı 2 oldu. Kayıtlı park alanı 77,47 ha korundu. Şifreli kayıt sonrası Kaydedildi işareti ve Verileri yenile ile sunucudan yeniden okuma doğrulandı.
- Uygulamadan KML indirildi ve XML/geometri yeniden açıldı: güncel sınır kapalı, 151 koordinat / 150 benzersiz köşe; topoloji geçerli; ITRF96 TM30 alanı 77,511846 ha. Güncel planın 82 referans noktasından 82'si içinde, 0'ı dışında. Arşivle beraber çıktı 164 referans noktası ve 2 geçerli poligon içeriyor; 164 benzersiz saha tesisi anlamına gelmez. Önceden bozuk arşiv sınırı dışa aktarım doğrulamasında hariç kalmaya devam etti.
- Hacı kaynak incelemesi 17.10.2026 tarihli 6 belgeyle güncellendi; datum eşleştirmesi çözümü ve projeksiyon alan farkları açıklandı. Güncel hukuki sınırın tüm onay zinciri ve tesis oturumları henüz tamamlanmadı.
- Kurtyolu: teklif raporu, NCZ, KMZ ve Nihai Sınır.XLS içerikleri incelendi. Teklif raporunda 39,72 ha; NCZ metninde 39,80 ha; KMZ birleşik çiziminde 42,2847 ha (TM30) farkı bulundu. 230 koordinatlı XLS'nin tek halka kabul edilmesi geçersiz geometri üretiyor; parça/sürüm çözümlemesi gerekli. Bu dosyalar mevcut onaylı sınır yerine geçirilmedi.
- Kurtyolu incelemesi 7 belge, mevcut 50 cetvel satırı ve 7 teyit konusuyla kaydedildi. Önceki inceleme arşivlendi. Sunucudan yeniden okunduğunda 19,98 ha harita, 19,90 ha kayıt ve mevcut sözleşme korundu.
- v23 gerçek yükleme penceresi denemesi: Kurtyolu KMZ'si Tesis seçeneğinde 5 alan / 0 çizgi / 0 nokta olarak önizlendi. Üretim verisine katman eklenmeden Vazgeç ile kapatıldı.
- Fiziksel saha GPS doğruluğu, tüm mobil cihazlarda PWA kurulumu ve bütün parkların eksiksiz tesis geometrileri bu testlerle tamamlandı sayılmaz.


## 17.10.2026 — v24 bilgi kutusu onay ifadesi

- Canlı M15 araması doğru tek nesneyi ve ona ait bilgi kutusunu açtı; saha mevcudiyeti ayrıca teyit edilmedi uyarısı korundu.
- Tarihsel plan onayı görülmüşken son geçerli sürüm araştırmasının bitmemesi, onayın hiç görülmemesi anlamına gelmez. Belirsiz plan etiketi “Onay ve güncel sürüm teyidi gerekli” olarak düzeltildi; tarih girmek planı otomatik güncel onaylı yapmıyor.
- Sınır panelinde önceki sürümün onay alanı geriye dönük okunuyor; Hacı'nın kaydedilen 10.04.2020 belge tarihi panelde gösterilebilir.
