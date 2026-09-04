package com.ht.tv

import android.content.Context
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Base64
import android.util.Log
import androidx.annotation.OptIn
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.drm.DefaultDrmSessionManager
import androidx.media3.exoplayer.drm.DrmSessionManager
import androidx.media3.exoplayer.drm.LocalMediaDrmCallback
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.ui.PlayerView
import org.json.JSONObject
import java.nio.charset.StandardCharsets

/**
 * Media3PlayerManager - Quản lý phát video Native bằng AndroidX Media3 / ExoPlayer
 * Hỗ trợ tăng tốc phần cứng (MediaCodec), ClearKey DRM, DASH MPD, HLS và Custom User-Agent.
 */
@OptIn(UnstableApi::class)
class Media3PlayerManager(
    private val context: Context,
    private val playerView: PlayerView,
    private val listener: PlayerEventListener
) {

    interface PlayerEventListener {
        fun onPlaybackStateChanged(state: String)
        fun onPlayerError(errorMsg: String)
    }

    private var exoPlayer: ExoPlayer? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private val TAG = "Media3PlayerManager"

    init {
        initializePlayer()
    }

    private fun initializePlayer() {
        if (exoPlayer != null) return

        // Cấu hình bộ đệm LoadControl tối ưu cho Live Stream và TV Box
        val loadControl = DefaultLoadControl.Builder()
            .setBufferDurationsMs(
                1200,   // minBufferMs (1.2s)
                6000,   // maxBufferMs (6s)
                600,    // bufferForPlaybackMs (0.6s)
                1200    // bufferForPlaybackAfterRebufferMs (1.2s)
            )
            .setPrioritizeTimeOverSizeThresholds(true)
            .build()

        exoPlayer = ExoPlayer.Builder(context)
            .setLoadControl(loadControl)
            .build()
            .apply {
                playWhenReady = true
                addListener(object : Player.Listener {
                    override fun onPlaybackStateChanged(playbackState: Int) {
                        val stateStr = when (playbackState) {
                            Player.STATE_BUFFERING -> "buffering"
                            Player.STATE_READY -> "ready"
                            Player.STATE_ENDED -> "ended"
                            Player.STATE_IDLE -> "idle"
                            else -> "idle"
                        }
                        listener.onPlaybackStateChanged(stateStr)
                    }

                    override fun onPlayerError(error: PlaybackException) {
                        Log.e(TAG, "ExoPlayer error: ${error.errorCodeName} - ${error.message}")
                        listener.onPlayerError(error.message ?: "Lỗi phát sóng từ máy chủ")
                    }
                })
            }

        playerView.player = exoPlayer
        playerView.useController = false // Điều khiển hoàn toàn qua lớp Web UI trong suốt
    }

    /**
     * Bắt đầu phát luồng truyền hình
     * @param streamUrl URL phát sóng (.m3u8, .mpd, .mp4, TS)
     * @param type "hls", "mpd", hoặc "mp4"
     * @param userAgent Custom HTTP User-Agent (VTVGo, Tizen, OTT)
     * @param drmType "clearkey" hoặc "widevine"
     * @param drmKeysJson Chuỗi JSON ClearKey dạng {"hex_key_id": "hex_key"}
     * @param licenseUrl URL License Server cho Widevine
     */
    fun playStream(
        streamUrl: String,
        type: String? = null,
        userAgent: String? = null,
        drmType: String? = null,
        drmKeysJson: String? = null,
        licenseUrl: String? = null
    ) {
        mainHandler.post {
            try {
                initializePlayer()
                val player = exoPlayer ?: return@post

                val defaultUa = userAgent ?: "Mozilla/5.0 (SMART-TV; LINUX; Tizen 10.0) AppleWebKit/537.36 (KHTML, like Gecko) 130.0.6723.116/10.0 TV Safari/537.36"
                val httpDataSourceFactory = DefaultHttpDataSource.Factory()
                    .setUserAgent(defaultUa)
                    .setAllowCrossProtocolRedirects(true)
                    .setConnectTimeoutMs(3500)
                    .setReadTimeoutMs(5000)

                // Cấu hình MediaItem
                val mediaItemBuilder = MediaItem.Builder()
                    .setUri(Uri.parse(streamUrl))

                // Xác định MIME type tối ưu để tránh lỗi màn hình đen trên TV Box
                val inferredMime = when {
                    type.equals("mpd", ignoreCase = true) || streamUrl.contains(".mpd") || streamUrl.contains("manifest.mpd") || !drmKeysJson.isNullOrEmpty() || (drmType != null && drmType.equals("clearkey", ignoreCase = true)) -> {
                        MimeTypes.APPLICATION_MPD
                    }
                    type.equals("mp4", ignoreCase = true) || streamUrl.contains(".mp4") -> {
                        MimeTypes.APPLICATION_MP4
                    }
                    type.equals("hls", ignoreCase = true) || streamUrl.contains(".m3u8") || streamUrl.contains(".php") || streamUrl.contains(".smil") || streamUrl.contains("stream") || streamUrl.contains("live") -> {
                        MimeTypes.APPLICATION_M3U8
                    }
                    else -> MimeTypes.APPLICATION_M3U8
                }
                mediaItemBuilder.setMimeType(inferredMime)

                // Cấu hình ClearKey / Widevine DRM nếu có
                var drmSessionManager: DrmSessionManager? = null
                if (drmType.equals("clearkey", ignoreCase = true)) {
                    if (!drmKeysJson.isNullOrEmpty()) {
                        val clearKeyDrmCallback = createClearKeyCallback(drmKeysJson)
                        if (clearKeyDrmCallback != null) {
                            drmSessionManager = DefaultDrmSessionManager.Builder()
                                .setUuidAndExoMediaDrmProvider(C.CLEARKEY_UUID, androidx.media3.exoplayer.drm.FrameworkMediaDrm.DEFAULT_PROVIDER)
                                .build(clearKeyDrmCallback)
                        }
                    } else if (!licenseUrl.isNullOrEmpty()) {
                        mediaItemBuilder.setDrmConfiguration(
                            MediaItem.DrmConfiguration.Builder(C.CLEARKEY_UUID)
                                .setLicenseUri(licenseUrl)
                                .build()
                        )
                    }
                } else if (drmType.equals("widevine", ignoreCase = true) && !licenseUrl.isNullOrEmpty()) {
                    mediaItemBuilder.setDrmConfiguration(
                        MediaItem.DrmConfiguration.Builder(C.WIDEVINE_UUID)
                            .setLicenseUri(licenseUrl)
                            .build()
                    )
                }

                val mediaSourceFactory = DefaultMediaSourceFactory(httpDataSourceFactory)
                if (drmSessionManager != null) {
                    mediaSourceFactory.setDrmSessionManagerProvider { drmSessionManager }
                }

                val mediaSource = mediaSourceFactory.createMediaSource(mediaItemBuilder.build())
                player.setMediaSource(mediaSource)
                player.prepare()
                player.play()
            } catch (e: Exception) {
                Log.e(TAG, "Lỗi nạp luồng phát: ", e)
                listener.onPlayerError(e.message ?: "Lỗi khởi tạo luồng phát")
            }
        }
    }

    /**
     * Tạo LocalMediaDrmCallback cho ClearKey từ danh sách Hex Key ID và Key
     */
    private fun createClearKeyCallback(drmKeysJson: String): LocalMediaDrmCallback? {
        return try {
            val json = JSONObject(drmKeysJson)
            val keysArray = org.json.JSONArray()
            val keysIterator = json.keys()

            while (keysIterator.hasNext()) {
                val keyIdHex = keysIterator.next()
                val keyHex = json.getString(keyIdHex)

                val keyIdB64 = base64UrlEncode(hexStringToByteArray(keyIdHex))
                val keyB64 = base64UrlEncode(hexStringToByteArray(keyHex))

                val keyObj = JSONObject().apply {
                    put("kty", "oct")
                    put("k", keyB64)
                    put("kid", keyIdB64)
                }
                keysArray.put(keyObj)
            }

            val jwkResponse = JSONObject().apply {
                put("keys", keysArray)
                put("type", "temporary")
            }.toString()

            LocalMediaDrmCallback(jwkResponse.toByteArray(StandardCharsets.UTF_8))
        } catch (e: Exception) {
            Log.e(TAG, "Lỗi phân giải ClearKey DRM: ", e)
            null
        }
    }

    private fun hexStringToByteArray(s: String): ByteArray {
        val len = s.length
        val data = ByteArray(len / 2)
        var i = 0
        while (i < len) {
            data[i / 2] = ((Character.digit(s[i], 16) shl 4) + Character.digit(s[i + 1], 16)).toByte()
            i += 2
        }
        return data
    }

    private fun base64UrlEncode(bytes: ByteArray): String {
        return Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)
    }

    fun pause() {
        mainHandler.post { exoPlayer?.pause() }
    }

    fun resume() {
        mainHandler.post { exoPlayer?.play() }
    }

    fun stop() {
        mainHandler.post { exoPlayer?.stop() }
    }

    fun setVolume(volume: Float) {
        mainHandler.post { exoPlayer?.volume = volume.coerceIn(0f, 1f) }
    }

    fun release() {
        mainHandler.post {
            exoPlayer?.release()
            exoPlayer = null
        }
    }
}
