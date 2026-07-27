# ⚡ Dev Dashboard | Taşınabilir Çevrimdışı Geliştirici Kapsülü

### Kullanılan Teknolojiler ve Diller (Technologies & Languages)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg?style=for-the-badge)](LICENSE)
[![Zero-Server](https://img.shields.io/badge/Architecture-Zero--Server-06B6D4.svg?style=for-the-badge)](#)
[![Portable](https://img.shields.io/badge/Deployment-100%25%20Portable-10B981.svg?style=for-the-badge)](#)

---

**Dev Dashboard**, internet bağlantısı veya herhangi bir yerel sunucu (Node.js, XAMPP, Python HTTP server vb.) gerektirmeden, doğrudan tarayıcı üzerinden `file://` protokolüyle çalışan **Sıfır Sunuculu (Zero-Server)** ve **%100 Taşınabilir (Portable)** bir geliştirici istasyonudur.

---

## 🌟 Mimari ve Tasarım Felsefesi

Sistem modüler ve temiz dosya yapısına sahiptir:
- `index.html`: Ana arayüz ve HTML5 semantik yapısı.
- `styles.css`: Quiet Luxury tasarım dili, Bento Grid düzeni ve karanlık tema CSS kuralları.
- `app.js`: GSAP çevrimdışı animasyon motoru, File System Access API disk senkronizasyon mantığı ve etkinlik dinleyicileri.
- `config.json`: Veritabanı ve kişiselleştirilebilir yapılandırma dosyası.

### 💾 Taşınabilir Veri Yönetimi (File System Access API)
- **LocalStorage Kullanılmaz**: Veriler tarayıcı hafızasında geçici olarak saklanmaz.
- Modern **File System Access API (`window.showOpenFilePicker`)** sayesinde arayüz üzerinden yapılan tüm değişiklikler (yeni komut ekleme, port güncelleme vb.) doğrudan disk üzerindeki `config.json` dosyasına yazılır.
- Dosyaları USB belleğinize veya taşınabilir sürücünüze koyup istediğiniz bilgisayarda çift tıklayarak anında çalıştırabilirsiniz.

---

## ✨ Temel Modüller ve Özellikler

### 1. 🚀 Hızlı Komut İstasyonu (Snippet Vault)
- Docker container parametreleri, Termux JAX derleme kodları, Magisk/ROM flash komutları ve sistem scriptlerini düzenli saklama.
- **Klavye Kısayolları**: `Ctrl+1`, `Ctrl+2` ... `Ctrl+9` tuş kombinasyonlarıyla komutları anında panoya kopyalama.
- **Tek Tıkla Panoya Kopyalama**: Anlık toast bildirimli kopyalama butonu.
- **Dinamik Filtreleme**: Kategoriye (Docker, Termux, ROM, Sistem) ve arama kelimesine göre hızlı erişim.

### 2. 🌐 Ağ ve Port Haritası (Local Network Map)
- Yerel ağınızda veya tünellerde çalışan servislerin (Ollama `11434`, N8N `5678`, Cloudflare tünelleri, Router Gateway `192.168.1.1` vb.) IP, port ve protokol dizini.
- Tek tıkla ilgili servise tarayıcıda yeni sekme açan launch butonları.
- Anında yeni servis ekleme ve düzenleme paneli.

### 3. ✨ Quiet Luxury (Sessiz Lüks) & Bento Grid UI
- **Tasarım Dili**: Derin koyu tema (Obsidian `#080A0F`), buzlu cam (glassmorphism) efektleri ve şampanya altını (`#D4AF37`) detaylar.
- **Bento Grid**: Asimetrik ama düzenli CSS Grid yapısı.
- **Çevrimdışı GSAP Animasyonları**: İnternet bağlantısı olmasa bile çalışan akıcı görsel geçişler.

---

## 🛠️ Hızlı Başlangıç (Kurulumsuz / Portable)

1. Depoyu bilgisayarınıza klonlayın veya indirin:
   ```bash
   git clone https://github.com/Arda2332/Dev_Dashboard.git
   ```
2. **`index.html`** dosyasına çift tıklayarak tarayıcınızda açın (URL: `file:///.../index.html`).
3. Sağ üstteki **`config.json Bağla`** butonuna tıklayıp dizindeki `config.json` dosyasını seçin.
4. Artık sistem tamamen diskinize bağlı çalışacaktır!

---

## 📂 Proje Yapısı

```
Dev_Dashboard/
├── index.html     # Ana HTML5 Arayüzü (Zero-Server)
├── styles.css     # Quiet Luxury & Bento Grid CSS Stilleri
├── app.js         # İstemci JS Mantığı & File System Access Controller
├── config.json    # Disk üzerindeki veritabanı (Snippets & Network Map)
└── README.md      # GitHub dokümantasyonu & Kullanılan Teknolojiler
```

---

## 👤 Geliştirici & Lisans

- **Geliştirici**: Mehmet Arda Demir
- **Lisans**: [MIT Lisansı](LICENSE) - Açık Kaynak ve Özgür Yazılım.