# Ek-10 saha raporu ve muhasebe kaynak kontrolü — v43

## Değişiklik

Yeni saha denetimleri park, yıl, dönem, tarih ve benzersiz rapor kimliğiyle ayrı kayıt olarak tutulur. İmzalı önceki rapora yazılmaz. Aynı dönem içindeki birden fazla ziyaret ayrı kalır. Geçmiş raporlardaki saha ve plan tespitleri yeni gözlem gibi aktarılmaz. İmzalı rapor görünümünün hücre düzenlemesi kapatılmıştır.

Park ve mali bilgiler oluşturma anında rapora alınır. Güncel kaynaktan yeniden almak açık bir eylemdir; saha bulguları korunur. Yıllık kira ve ödeme dönemi alanları kaynak kontrollüdür. Vergi/fon satırı bulunması, yıllık kira tahakkukunun sıfır olduğu anlamına gelmez. Asıl kira alt hesabı yoksa teyit gerektiği belirtilir.

Yeni kayıtlar şifreli ana veride saklanır ve mevcut kayıt bağlantısından senkronize edilir. Değişen saha taslakları ayrıca cihazda erişim parolasıyla AES-GCM şifrelenerek saklanır. Kurtarma işlemi daha yeni sunucu kaydını eski cihaz kaydıyla değiştirmez. Depolama veya ağ başarısızlığı başarı gibi gösterilmez. Harita altlığı ve kaynak dosyalarının çevrimdışı erişimi ayrı önbellek koşullarına bağlıdır.

PDF yazdırma görünümüne kaynak kapsamı ve taslak niteliği eklenir. Excel çıktısında özgün formun yanında Kaynak bilgisi sayfası bulunur. Bu işlem elektronik imza sağlamaz.

## Kaynak incelemesi

6 Kasım 2026 tarihinde bağlı Drive muhasebe kök klasörü, 22.10.2026 dökümleri, 23.10.2026 kira takip cetveli, Ek-10 dönem klasörleri ve ekli denetim çalışma kitabı incelendi. Üç Drive muhasebe dosyası mevcut kaynağın SHA-256 özetleriyle aynıydı; 296 muhasebe satırının tamamı uygulama kayıtlarıyla eşleşti. 17 parkın açık kalemleri kaynak dökümlerden bağımsız Decimal hesabıyla mutabık bulundu. İkinci dönem klasörü kontrol sırasında boştu. Yeni döküm veya yapılmış denetim uydurulmadı.

Kaynak bağlantıları, inceleme tarihi ve kapsamı ayrı şifreli kaynak kontrol dosyasına eklendi. Ham muhasebe satırları, park kayıtları, sözleşmeler ve eski denetim kayıtları değişmedi. Takip cetvelinde ileri sürülen düzeltmeler asıl fiş, ödeme belgesi veya sözleşmenin yerine geçirilmedi. Kuruluş, plan ve coğrafi kayıtların tümünün doğrulandığı iddia edilmez.

## Test

- 125 JavaScript ve 6 Python testi başarılı.
- Yeni rapor için tarih/dönem uyumu, tekrar ziyaret ayrımı, parklar arası ayrım, imzalı arşiv koruması.
- Vergi/fon satırından sahte sıfır kira tahakkuku oluşmaması.
- Mali kaynak yenilemesinde saha bulgularının korunması.
- Şifreli yerel taslak, kurtarma, yeni sunucu kaydını koruma ve depolama hatası.
- Özgün Ek-10 modeliyle yeni dönem başlığı, boş saha bulguları ve mali alan kilidi kontrol edildi.
- Excel üretildi ve tekrar açılarak yeni tespit ile kaynak notunun gerçekten dosyada olduğu doğrulandı.
- Ana verinin şifrele/aç çevrimi ve ham kayıtların korunması doğrulandı.
