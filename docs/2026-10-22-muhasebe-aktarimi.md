# Muhasebe dökümü aktarımı – 22.10.2026

- Aynı hesaba ait alt hesap dosyaları tek işlemde birlikte seçilebilir.
- Dosya seçimi kullanılamadığında kaynak adıyla birlikte CSV metni yapıştırılabilir.
- Önizleme satır, alt hesaplar, ilk/son yevmiye, bakiye ve mükerrer elle kayıt sayısını gösterir.
- 120/127 hesap uyuşmazlığı, geçersiz tutar ve aynı muhasebe anahtarına sahip tekrarlı satırlar uygulanamaz.
- Hesap, kaynak adı veya metin değiştiğinde önceki önizleme geçersizleşir. Bekleyen okuma sonucu yeni seçimin üzerine yazamaz.
- Mevcut eşleştirme motoru ve finansal formüller değişmedi. Kaynakta belirtilmeyen döküm tarihi üretilmez.
- 98 JavaScript testi geçti; sözdizimi ve diff boşluk denetimi geçti.

Canlı veri aktarımı ve yenileme sonrası kontrol, yönetici ekranında ayrıca yapılır. Muhasebe dökümünün son yevmiye tarihi aktarım günüyle aynı kabul edilmez. İhtarnameler veya ek takip cetvelleri bağımsız tahakkuk/tahsilat gibi işlenmez.

## Kaynakla mutabakat sırasında bulunan düzeltme

Aynı yevmiyede, farklı vadeli vergi/fon satırındaki yeniden borçlandırma önceki motor tarafından negatif tahsilat sayılarak atlanıyordu. Net borç artık kaynak fişi, hesap ve vadesiyle ayrı muhasebe düzeltmesi olarak korunur. Ham döküm satırları değiştirilmez. Ödeme sırası ters çevrilerek ve sonraki tahsilatla kapanma senaryosuyla test edildi.

Takip ZIP paketinin özgün baytları ve belge listesi şifreli ana kayıtta saklanır. Muhasebe ekranından paket ve içindeki Excel/PDF/Word dosyaları indirilebilir. Taslak yazılar gönderilmiş yazı gibi sunulmaz. Ek paketteki vade varsayımları hesaplama motoruna otomatik taşınmaz.

101 JavaScript testi ve 6 Python testi geçti. Özel kaynak incelemesinde tüm parkların muhasebe bakiyesi ile açık kalemleri ayrı ayrı eşitlendi; şifrele/aç ve kaynak ZIP bayt karşılaştırması doğrulandı. Park, harita, sözleşme, denetim, mevcut form ve oran kayıtları korundu. Bu doğrulama saha geometrilerinin veya tüm eski geliştirme taleplerinin tamamlandığını göstermez.
