# Yazma bağlantısını yenileme · v40

Anahtar yenileme, ilk kurulumdan ayrıldı. Yönetici oturumunda doğrulanmış parola bellekte mevcutsa ekranda yalnız yeni yazma anahtarı istenir. Oturum parolası yoksa mevcut parola bir kez sorulur; yenileme sırasında yeni parola belirlenmez ve ad bilgisi değiştirilmez.

Yeni anahtar, mevcut oturuma atanmadan kontrol edilir. Yönetici kaydı ve SHA değeri aynı GitHub yanıtından okunur. Kayıt mevcut yönetici parolasıyla açılır; yalnız yazma anahtarı ve güncelleme tarihi değiştirilir. Kimlik, kullanıcı dizini anahtarı ve diğer alanlar korunur. Yenilenen kayıt aynı parolayla AES-GCM şifrelenerek, beklenen dosya SHA değeriyle yazılır. Başka bir işlem kaydı değiştirdiyse üzerine yazılmaz.

Başarısız anahtar, yanlış mevcut parola veya yazma hatası, mevcut yönetici oturumunu kapatmaz ve taslağı silmez. Parola doğrulanmadan yeni anahtar kurulmaz. Aday anahtar kontrolü tek başına yönetici yetkisi vermez. Pencere kapatılırsa henüz başlamamış yazma işlemi başlatılmaz. İşlem sonrasında kişisel kullanıcıların yazma bağlantıları mevcut mekanizmayla güncellenir; bu adım başarısızsa ayrı bildirilir.

Gerçek yeni anahtar GitHub hesabında kullanıcı tarafından oluşturulmalı ve yalnız uygulamadaki gizli alana yapıştırılmalıdır. Bu kod güncellemesi mevcut geçersiz anahtarı kendiliğinden yenilemez. Gerçek yönetici kaydı, parola veya muhasebe dosyaları bu yayın sırasında değiştirilmez.

115 JavaScript ve 6 Python testi başarılı. Ek testler gerçek test anahtarlarıyla AES-GCM çözme/yeniden şifreleme, aynı parolanın korunması, dizin anahtarının korunması, SHA çatışması, yanlış parola, geçersiz aday anahtar ve pencere kapatma yarışını kapsar. Gerçek anahtar oluşturulmadığı için canlı anahtar değiştirme işlemi yapılmış sayılmaz.
