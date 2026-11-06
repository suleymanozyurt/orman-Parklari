# Yönetici girişi ve sade arayüz · 06.11.2026

## Doğrulanan sorun

Yönetici parolası şifreli yönetici kaydını başarıyla açıyordu. Kayıtlı GitHub yazma anahtarı ise gerçek API denemesinde HTTP 401 döndürdü. Eski giriş akışı, parola doğrulamasını yazma bağlantısının geçerliliğine bağladığından oturumu açmıyordu.

## Değişiklik

- Yönetici kaydı doğru parolayla açılınca oturum doğrulanır. Yazma bağlantısının durumu ayrıca kontrol edilir.
- Geçersiz veya erişilemeyen yazma bağlantısında yerel taslak düzenleme mümkündür. Sunucuya kayıt engellenir; bağlantı durumu ve taslağın kaydedilmediği açıkça gösterilir.
- Yanlış parola yetki açmaz. Kişisel hesaplar aynı rol sınırlarını korur. Geçersiz bir anahtar tek başına yönetici yetkisi vermez.
- Geçersiz anahtar genel kayıt/sürüm okuma isteklerine eklenmez. Ağ hatası, istek sınırı ve yanlış parola ayrı açıklanır.
- Oturumun açık tutulması isteğe bağlıdır. Eski kalıcı oturum yeni oturumu gölgeleyemez. Bilinen geçersiz anahtar cihazda kalıcı saklanmaz.
- Giriş isteği sürerken pencerenin kapatılması sonradan oturum açamaz; çift gönderim engellenir.
- Beş ana menü: Genel Durum, Harita, Orman Parkları, Muhasebe, Mevzuat ve Formlar. Eski sayfa adresleri çalışmaya devam eder.
- Özet ekranda ilk üç öncelikli iş gösterilir. Diğer işler ve ödeme takvimi tek dokunuşla açılır. Mükerrer sayfa kartları kaldırılır.
- Program sürümü, muhasebe son yevmiye tarihleri ve TÜFE ayı ayrı gösterilir. Kaynak eşleşmesi bugüne ait muhasebe verisi anlamına gelmez.

## Sınırlar

Geçersiz GitHub anahtarı bu kod değişikliğiyle yenilenmez. Kullanıcı hesabından yeni yazma anahtarı oluşturulup uygulamanın Anahtarı yenile ekranından kurulmalıdır. Mevcut parola ve şifreli yönetici kaydı değiştirilmedi. Muhasebe, harita, belge dosyaları ve hesap formülleri değiştirilmedi.

## Testler

109 JavaScript testi ve 6 Python testi yerelde başarılı. Yeni kontroller: doğru parola + geçersiz anahtar, yanlış parola, sağlıklı bağlantı, ağ/istek sınırı, yazmanın engellenmesi, anonim genel sürüm okuma, pencere kapatma yarışı, kalıcı oturum çakışması ve bütün takvim satırlarının erişilebilirliği. Canlı tarayıcı kontrolü yayın sonrasında ayrıca yapılır.
