package com.ht.tv

import android.content.Context
import android.util.Log
import android.webkit.JavascriptInterface
import org.json.JSONObject

/**
 * WebAppInterface - Cầu nối Javascript Interface hai chiều giữa Web UI và Native Media3
 */
class WebAppInterface(
    private val context: Context,
    private val playerManager: Media3PlayerManager
) {
    private val TAG = "WebAppInterface"

    @JavascriptInterface
    fun playStream(jsonString: String) {
        try {
            Log.d(TAG, "playStream called with payload: $jsonString")
            val json = JSONObject(jsonString)
            val url = json.getString("url")
            val type = json.optString("type", "hls")
            val userAgent = json.optString("userAgent", null)

            var drmType: String? = null
            var drmKeysJson: String? = null
            var licenseUrl: String? = null

            if (json.has("drm")) {
                val drmObj = json.getJSONObject("drm")
                drmType = drmObj.optString("type", null)
                licenseUrl = drmObj.optString("licenseUrl", null)
                if (drmObj.has("keys")) {
                    drmKeysJson = drmObj.getJSONObject("keys").toString()
                }
            }

            playerManager.playStream(
                streamUrl = url,
                type = type,
                userAgent = userAgent,
                drmType = drmType,
                drmKeysJson = drmKeysJson,
                licenseUrl = licenseUrl
            )
        } catch (e: Exception) {
            Log.e(TAG, "Lỗi parse playStream payload: ", e)
        }
    }

    @JavascriptInterface
    fun stop() {
        Log.d(TAG, "stop() called")
        playerManager.stop()
    }

    @JavascriptInterface
    fun pause() {
        Log.d(TAG, "pause() called")
        playerManager.pause()
    }

    @JavascriptInterface
    fun resume() {
        Log.d(TAG, "resume() called")
        playerManager.resume()
    }

    @JavascriptInterface
    fun setVolume(volume: Float) {
        playerManager.setVolume(volume)
    }

    @JavascriptInterface
    fun isNativeApp(): Boolean {
        return true
    }
}
