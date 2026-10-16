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
