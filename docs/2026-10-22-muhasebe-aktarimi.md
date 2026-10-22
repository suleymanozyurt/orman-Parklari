# Muhasebe dökümü aktarımı – 22.10.2026

- Aynı hesaba ait alt hesap dosyaları tek işlemde birlikte seçilebilir.
- Dosya seçimi kullanılamadığında kaynak adıyla birlikte CSV metni yapıştırılabilir.
- Önizleme satır, alt hesaplar, ilk/son yevmiye, bakiye ve mükerrer elle kayıt sayısını gösterir.
- 120/127 hesap uyuşmazlığı, geçersiz tutar ve aynı muhasebe anahtarına sahip tekrarlı satırlar uygulanamaz.
- Hesap, kaynak adı veya metin değiştiğinde önceki önizleme geçersizleşir. Bekleyen okuma sonucu yeni seçimin üzerine yazamaz.
- Mevcut eşleştirme motoru ve finansal formüller değişmedi. Kaynakta belirtilmeyen döküm tarihi üretilmez.
- 98 JavaScript testi geçti; sözdizimi ve diff boşluk denetimi geçti.

Canlı veri aktarımı ve yenileme sonrası kontrol, yönetici ekranında ayrıca yapılır. Muhasebe dökümünün son yevmiye tarihi aktarım günüyle aynı kabul edilmez. İhtarnameler veya ek takip cetvelleri bağımsız tahakkuk/tahsilat gibi işlenmez.
