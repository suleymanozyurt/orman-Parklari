# 12.11.2026 — v45

- Açık arayüz sadeleştirildi; park seçimi tek yerde tutuldu, ayrıntı panelleri açılır hale getirildi. Tüm eski sayfa bağlantıları korunur.
- Kaynak inceleme aktarımı fark önizlemesiyle yapılır. Mevcut muhasebe kaynaklarıyla SHA-256 eşleşmeyen dosya bu akışta kabul edilmez; yeni döküm muhasebe aktarımıyla incelenir. Bu işlem hiçbir mali hareketi, vadeyi, sözleşmeyi veya harita geometrisini değiştirmez.
- Aynı inceleme paketi iki kez uygulanamaz. Önceki inceleme arşivlenir; daha yeni incelemeler korunur. Metin değiştiğinde önizleme geçersizleşir. Kaynak tarihi, son yevmiye ve plan onayı ayrı gösterilir.
- Giriş ve çıkış olayları bu cihazda yöneticiye ait özel anahtarla açılacak biçimde RSA-OAEP/AES-GCM ile şifrelenir. Ortak görüntüleme parolası kişi kimliği sayılmaz. Yönetici parolası normal değiştirilirken özel anahtar korunur.
- Güncel ana daldaki şifreli veri dosyası korundu. Eski geliştirme dosyasıyla toplu veri değişimi yapılmadı. Drive incelemesi uygulamadaki aktarım önizlemesi üzerinden güncel kayıtlara uygulanır.

## Doğrulama ve sınırlar

134 JavaScript testi ve 6 Python oran testi başarılı. Hesap, vade, mükerrer kayıt, geometri ve iç halka, eşzamanlı kayıt, çevrimdışı dosyalar, kaynak sürümleri, Ek-10 kurtarma, şifreli günlük ve inceleme aktarımı testleri kapsandı.

Üç Ekim muhasebe dosyasının SHA-256 değerleri mevcut aktarım kaynaklarıyla birebir aynı bulundu. 296 kaynak satırı tekrar eklenmedi. Bu, bugünkü muhasebe bakiyesinin teyidi değildir.

Yeni doğrulanmış geometri eklenmedi. Göktürk ve Azizpaşa datum/son onay teyidi; Kurtyolu imzalı 5. revizyonla sayısal taslak arasındaki farkların çözümü gereklidir. Eksik kaynaklar inceleme kaydında gösterilir.

Giriş günlüğü yalnız bu tarayıcıdaki son 200 olayı kapsar. IP, şehir, başarısız giriş ve diğer cihazların oturumları mevcut sunucusuz yapıda toplanmaz. Bütün cihazları kapsayan güvenilir günlük için sunucuda kimlik doğrulayan merkezî hizmet bağlı değildir.

Resmî oranların zamanlanmış iş akışı ve açık uygulamadaki kaynak eşitlemesi korunur. Özel Drive arşivini uygulama kapalıyken tarayan bağlantı henüz kurulmuş değildir.
