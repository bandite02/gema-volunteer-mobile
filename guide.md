# Panduan Run & Build Mobile App (React Native Expo)

Dokumen ini berisi ringkasan cara menjalankan (Development/Debug) dan membuat installer (Build Standalone Release APK) untuk aplikasi mobile ini, serta cara menghubungkannya dengan backend Laravel API.

---

## 📥 1. Urutan Langkah Pertama Kali Setelah Clone Repository

Jika Anda baru saja me-clone repositori ini di komputer baru, ikuti urutan langkah berikut:

### Langkah 1: Install Dependencies Node Modules
Buka terminal di folder `mobile`, lalu jalankan:
```bash
npm install
```

### Langkah 2: Buat Berkas Konfigurasi `local.properties` Android
Buat berkas bernama `local.properties` di dalam folder `mobile/android/` dan isikan path SDK & NDK berikut:
```ini
sdk.dir=C\:\\Users\\who i am\\AppData\\Local\\Android\\Sdk
ndk.dir=C\:\\Users\\who i am\\AppData\\Local\\Android\\Sdk\\ndk\\26.1.10909125
```

### Langkah 3: Set Environment Variable Java & Android SDK (Khusus Windows)
Jalankan perintah ini di PowerShell sekali saja:
```powershell
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Android\Android Studio\jbr', 'User')
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\who i am\AppData\Local\Android\Sdk', 'User')
```

---

## 🚀 2. Cara Run Mode Development (Debugging via Expo Go)

Mode ini digunakan saat proses pengkodean (development) di mana Anda bisa melihat perubahan kode secara langsung (*Hot Reload*) via Expo Go.

1. Buka terminal di folder `mobile`.
2. Jalankan perintah (menggunakan flag `--clear` untuk membersihkan cache bundler):
   ```powershell
   npx expo start --clear
   ```
3. Buka aplikasi **Expo Go** di HP, lalu scan QR Code yang tampil di terminal.
4. *Tips Debugging:* Tekan tombol **`j`** di terminal untuk membuka **Chrome DevTools Debugger** di laptop.

---

## 📦 3. Cara Build & Install Standalone APK Release (Aplikasi GEMA)

Mode ini menghasilkan installer APK tipe Release resmi yang berjalan secara mandiri di HP tanpa bergantung pada Metro bundler maupun Expo Go.

### ⚙️ A. Perintah Build APK Rilis (PowerShell)
Buka terminal PowerShell di folder `mobile/android`, lalu jalankan:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; $env:ANDROID_HOME="C:\Users\who i am\AppData\Local\Android\Sdk"; $env:ANDROID_NDK_HOME="C:\Users\who i am\AppData\Local\Android\Sdk\ndk\26.1.10909125"; .\gradlew.bat app:assembleRelease -x lint -x test
```

### 📲 B. Perintah Install APK Langsung ke HP via USB (ADB)
Colokkan HP via kabel USB (pastikan **USB Debugging** aktif), lalu jalankan perintah ini di PowerShell:

```powershell
$env:ANDROID_HOME="C:\Users\who i am\AppData\Local\Android\Sdk"; & "$env:ANDROID_HOME\platform-tools\adb.exe" install -r "d:\YOSHI\WORK\WORKSPACE\MYWORK\GEMA\mobile\android\app\build\outputs\apk\release\app-release.apk"
```

### 📁 C. Lokasi Berkas Hasil APK (Untuk Disalin/Kirim Manual)
Berkas APK rilis yang dihasilkan akan tersimpan di path berikut:

* **Lokasi Folder:** `mobile/android/app/build/outputs/apk/release/`
* **Path Lengkap:** `d:\YOSHI\WORK\WORKSPACE\MYWORK\GEMA\mobile\android\app\build\outputs\apk\release\app-release.apk`

---

## ❓ Mengapa Proses Build Pertama Kali Terasa Sangat Lama?

Build pertama kali (first build) biasanya memakan waktu 3–10 menit karena beberapa alasan berikut:

1. **Mengunduh Dependencies Gradle:** Gradle mengunduh ratusan pustaka pendukung, Android SDK Build Tools, NDK/C++ toolchains, dan pustaka native React Native dari internet untuk pertama kalinya.
2. **Kompilasi Kode C++/Java/Kotlin:** Gradle mengomplikasi seluruh kode native dari core React Native dan third-party library (`async-storage`, `datetimepicker`, `image-picker`, `secure-store`, dll).
3. **Bundling & Minifikasi JavaScript:** Metro Bundler mengomplikasi, memaketkan, dan mengompresi ratusan file JavaScript/React Native menjadi 1 file rilis teroptimasi (`index.js`).

> 💡 **Build berikutnya akan jauh lebih cepat** (hanya hitungan detik/menit singkat) karena Gradle dan Metro sudah menyimpan cache (*build-cache*).

---

## 🔧 Troubleshooting Umum

* **Error `JAVA_HOME is not set`:**
  Jalankan `$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"` sebelum memanggil `gradlew`.
* **Error `SDK location not found`:**
  Pastikan file `mobile/android/local.properties` berisi `sdk.dir=C:/Users/who i am/AppData/Local/Android/Sdk` dan `ndk.dir=C:/Users/who i am/AppData/Local/Android/Sdk/ndk/26.1.10909125`.
* **Error `Network Error` / Status 500 di HP:**
  1. Pastikan API URL di `App.js` mengarah ke server publik `https://volunteer-api.gemakita.id/api`.
  2. Pastikan file `CorsMiddleware.php` dan `User.php` di server backend sudah ter-update.

