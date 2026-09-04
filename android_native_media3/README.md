# HT TV - Native Android Media3 (ExoPlayer) & Web UI Layer

Kiến trúc phân tách hiệu năng cao dành cho **Android TV**, **Android TV Box** và thiết bị di động Android:

## 1. Nguyên lý hoạt động

- **UI Layer (Lớp giao diện)**: 
  - Chạy bằng `WebView` trong suốt (`Color.TRANSPARENT`).
  - Đảm nhận hiển thị toàn bộ giao diện: Danh sách kênh theo nhóm, menu nổi, logo kênh, bộ giải mã zing radio, tìm kiếm kênh bằng giọng nói và nhận phím điều khiển từ xa (Remote D-Pad: Up/Down/Left/Right/OK/Back/PageUp/PageDown).
  - Tự động tắt thẻ `<video>` HTML5 khi phát hiện chạy trong môi trường Native Android để tiết kiệm 100% tài nguyên CPU/RAM cho phần video.

- **Playback Layer (Lớp phát sóng Native Media3 / ExoPlayer)**:
  - Nằm ở lớp `PlayerView` bên dưới WebView.
  - Sử dụng trực tiếp bộ giải mã phần cứng (`MediaCodec`) của Android TV / Box để giải mã HLS (.m3u8), DASH (.mpd), TS và MP4.
  - Hỗ trợ giải mã bản quyền **ClearKey DRM** (LocalMediaDrmCallback với JWK key mapping) và **Widevine DRM**.
  - Tùy biến `User-Agent` HTTP header (VTVGo, Tizen Smart TV, ZingRadio OTT).

- **Bi-directional Bridge (`nativeBridge.ts` <-> `WebAppInterface.kt`)**:
  - Web UI gửi payload luồng phát (URL, loại stream, DRM keys, User-Agent, cờ backup).
  - Native Player gửi ngược lại trạng thái (`buffering`, `ready`, `idle`, `ended`) hoặc thông báo lỗi (`onPlayerError`).
  - Khi luồng chính gặp sự cố, Web UI tự động phát hiện và chuyển tiếp luồng dự phòng (`backupUrl`) sang Native Player.

---

## 2. Hướng dẫn mở và Build trong Android Studio

1. Mở **Android Studio**.
2. Chọn **Open** và duyệt tới thư mục `android_native_media3`.
3. Chờ Gradle đồng bộ (Sync Project with Gradle Files).
4. Trong `MainActivity.kt`, bạn có thể đổi `WEB_APP_URL` sang URL ứng dụng của bạn hoặc sao chép thư mục build `dist` vào `app/src/main/assets/dist/index.html` để chạy offline.
5. Cắm Android TV Box hoặc kết nối qua WiFi ADB (`adb connect <IP_TV_BOX>:5555`) và nhấn **Run (Shift + F10)**.

---

## 3. Cấu trúc thư mục

```text
android_native_media3/
├── app/
│   ├── src/main/
│   │   ├── java/com/ht/tv/
│   │   │   ├── MainActivity.kt        # Khởi tạo PlayerView + WebView trong suốt, ánh xạ D-Pad Remote
│   │   │   ├── Media3PlayerManager.kt # Quản lý ExoPlayer Media3, HLS, MPD, ClearKey DRM
│   │   │   └── WebAppInterface.kt     # @JavascriptInterface cầu nối 2 chiều
│   │   ├── res/layout/
│   │   │   └── activity_main.xml      # FrameLayout xếp chồng PlayerView (dưới) và WebView (trên)
│   │   └── AndroidManifest.xml        # Cấu hình Android TV Leanback & Network Security
│   └── build.gradle.kts               # Khai báo androidx.media3:media3-exoplayer
├── gradle/
│   └── libs.versions.toml
├── build.gradle.kts
├── settings.gradle.kts
└── README.md
```
