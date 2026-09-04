package com.ht.tv

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.ui.PlayerView

class MainActivity : AppCompatActivity(), Media3PlayerManager.PlayerEventListener {

    private val TAG = "HT_TV_Native"
    private lateinit var playerView: PlayerView
    private lateinit var webView: WebView
    private lateinit var playerManager: Media3PlayerManager

    // URL Web UI (có thể trỏ tới domain server hoặc file:///android_asset/dist/index.html)
    private val WEB_APP_URL = "https://ais-dev-pixd2idi6fqou6nm63h2ww-481084556713.asia-southeast1.run.app"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Giữ màn hình luôn sáng (Keep Screen On) cho Smart TV / TV Box
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        hideSystemUI()

        setContentView(R.layout.activity_main)

        playerView = findViewById(R.id.player_view)
        playerView.keepScreenOn = true

        webView = findViewById(R.id.web_view)
        webView.keepScreenOn = true

        // 1. Khởi tạo Native Media3 ExoPlayer
        playerManager = Media3PlayerManager(this, playerView, this)

        // 2. Cấu hình WebView trong suốt làm UI Layer
        setupTransparentWebView()

        // 3. Nạp Web UI
        webView.loadUrl(WEB_APP_URL)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupTransparentWebView() {
        // Nền trong suốt để lộ PlayerView phía dưới
        webView.setBackgroundColor(Color.TRANSPARENT)
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        // Ưu tiên tiến trình WebView Renderer ở mức IMPORTANT trên Android TV / TV Box để tránh bị hệ thống tắt khi thiếu RAM
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false)
            } catch (e: Exception) {
                Log.w(TAG, "Could not set renderer priority policy: ${e.message}")
            }
        }

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.mediaPlaybackRequiresUserGesture = false
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // Đăng ký Javascript Interface cho giao tiếp 2 chiều
        val webAppInterface = WebAppInterface(this, playerManager)
        webView.addJavascriptInterface(webAppInterface, "AndroidBridge")
        webView.addJavascriptInterface(webAppInterface, "AndroidMedia3")
        webView.addJavascriptInterface(webAppInterface, "AndroidExoPlayer")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                return false // Mọi điều hướng chạy trong WebView
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Thiết lập class nền trong suốt cho Web UI
                webView.evaluateJavascript("document.body.classList.add('is-native-android');", null)
                Log.d(TAG, "Web UI Page finished loading: $url")
            }

            // Ghi log lỗi HTTP của trang chính và tài nguyên mạng
            override fun onReceivedHttpError(
                view: WebView?,
                request: WebResourceRequest?,
                errorResponse: WebResourceResponse?
            ) {
                super.onReceivedHttpError(view, request, errorResponse)
                val url = request?.url?.toString() ?: "unknown"
                val statusCode = errorResponse?.statusCode ?: 0
                val reason = errorResponse?.reasonPhrase ?: "HTTP Error"
                Log.e(TAG, "[HTTP_ERROR] Status $statusCode ($reason) at $url")
            }

            // Ghi log lỗi kết nối Web
            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                val url = request?.url?.toString() ?: "unknown"
                val desc = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    error?.description ?: "Network error"
                } else {
                    "Network error"
                }
                Log.e(TAG, "[WEB_ERROR] Error loading $url: $desc")
            }

            // Cơ chế tự động phát hiện WebView renderer bị treo trên Android TV Box (API 26+ / 29+) và phục hồi
            override fun onRenderProcessGone(view: WebView?, detail: RenderProcessGoneDetail?): Boolean {
                val didCrash = detail?.didCrash() ?: false
                val priority = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    detail?.rendererPriorityAtExit() ?: -1
                } else {
                    -1
                }
                Log.e(TAG, "[RENDERER_CRASH] WebView render process gone! Did crash: $didCrash, Priority: $priority. Performing auto-recovery...")

                // Hủy bỏ WebView cũ bị treo và tạo lại phiên làm việc mới
                try {
                    (view?.parent as? ViewGroup)?.let { parent ->
                        parent.removeView(view)
                        view?.destroy()

                        // Tạo WebView mới thay thế vào layout
                        val newWebView = WebView(this@MainActivity).apply {
                            id = R.id.web_view
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                        }
                        parent.addView(newWebView)
                        this@MainActivity.webView = newWebView
                        setupTransparentWebView()
                        newWebView.loadUrl(WEB_APP_URL)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error recreating WebView after render crash: ${e.message}")
                }
                return true // Trả về true để thông báo Android OS không buộc dừng ứng dụng (prevent crash)
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                consoleMessage?.let {
                    val msg = it.message()
                    val src = it.sourceId()
                    val line = it.lineNumber()
                    when (it.messageLevel()) {
                        ConsoleMessage.MessageLevel.ERROR -> Log.e(TAG, "[JS_CONSOLE_ERROR] ($src:$line) $msg")
                        ConsoleMessage.MessageLevel.WARNING -> Log.w(TAG, "[JS_CONSOLE_WARN] ($src:$line) $msg")
                        else -> Log.d(TAG, "[JS_CONSOLE] $msg")
                    }
                }
                return true
            }
        }
    }

    // Callbacks từ Media3 Native gửi về Web UI
    override fun onPlaybackStateChanged(state: String) {
        runOnUiThread {
            webView.evaluateJavascript("if (window.__onNativePlaybackState) window.__onNativePlaybackState('$state');", null)
        }
    }

    override fun onPlayerError(errorMsg: String) {
        runOnUiThread {
            val safeMsg = errorMsg.replace("'", "\\'")
            webView.evaluateJavascript("if (window.__onNativePlayerError) window.__onNativePlayerError('$safeMsg');", null)
        }
    }

    // Điều khiển Android TV Remote D-Pad (Up, Down, Left, Right, OK, Back, Channel Up/Down)
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        when (keyCode) {
            KeyEvent.KEYCODE_DPAD_CENTER,
            KeyEvent.KEYCODE_ENTER,
            KeyEvent.KEYCODE_NUMPAD_ENTER -> {
                dispatchJsKeyEvent("Enter", 13)
                return true
            }
            KeyEvent.KEYCODE_DPAD_UP -> {
                dispatchJsKeyEvent("ArrowUp", 38)
                return true
            }
            KeyEvent.KEYCODE_DPAD_DOWN -> {
                dispatchJsKeyEvent("ArrowDown", 40)
                return true
            }
            KeyEvent.KEYCODE_DPAD_LEFT -> {
                dispatchJsKeyEvent("ArrowLeft", 37)
                return true
            }
            KeyEvent.KEYCODE_DPAD_RIGHT -> {
                dispatchJsKeyEvent("ArrowRight", 39)
                return true
            }
            KeyEvent.KEYCODE_CHANNEL_UP,
            KeyEvent.KEYCODE_PAGE_UP -> {
                dispatchJsKeyEvent("PageUp", 33)
                return true
            }
            KeyEvent.KEYCODE_CHANNEL_DOWN,
            KeyEvent.KEYCODE_PAGE_DOWN -> {
                dispatchJsKeyEvent("PageDown", 34)
                return true
            }
            KeyEvent.KEYCODE_BACK -> {
                dispatchJsKeyEvent("Escape", 27)
                return true
            }
        }
        return super.onKeyDown(keyCode, event)
    }

    private fun dispatchJsKeyEvent(key: String, keyCode: Int) {
        val script = """
            (function() {
                var event = new KeyboardEvent('keydown', {
                    key: '$key',
                    code: '$key',
                    keyCode: $keyCode,
                    which: $keyCode,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(event);
            })();
        """.trimIndent()
        webView.evaluateJavascript(script, null)
    }

    private fun hideSystemUI() {
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_FULLSCREEN
        )
    }

    override fun onResume() {
        super.onResume()
        hideSystemUI()
        playerManager.resume()
    }

    override fun onPause() {
        super.onPause()
        playerManager.pause()
    }

    override fun onDestroy() {
        super.onDestroy()
        playerManager.release()
        webView.destroy()
    }
}
