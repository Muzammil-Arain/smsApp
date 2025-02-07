package com.smsapp
import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.google.android.gms.auth.api.phone.SmsRetriever
import org.json.JSONArray
import org.json.JSONObject

class SmsReaderModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "SmsReader"
    }

    @ReactMethod
    fun startSmsRetriever(promise: Promise) {
        val client = SmsRetriever.getClient(reactApplicationContext)
        val task = client.startSmsRetriever()

        task.addOnSuccessListener {
            promise.resolve("SMS Retriever started successfully.")
        }.addOnFailureListener { e ->
            promise.reject("SMS_RETRIEVER_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getOtpMessages(promise: Promise) {
        if (ActivityCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSION_DENIED", "READ_SMS permission not granted.")
            return
        }

        val otpPattern = "\\b\\d{4,6}\\b" // Matches 4-6 digit OTP codes
        val otpList = JSONArray()

        try {
            val uri = Uri.parse("content://sms/inbox")
            val cursor = reactApplicationContext.contentResolver.query(
                uri,
                arrayOf("address", "body", "date"),
                null,
                null,
                "date DESC"
            )

            cursor?.use {
                while (it.moveToNext()) {
                    val address = it.getString(it.getColumnIndexOrThrow("address"))
                    val body = it.getString(it.getColumnIndexOrThrow("body"))

                    // Filter messages containing OTP
                    if (body.contains("OTP", true) || body.contains("verification", true)) {
                        val matcher = Regex(otpPattern).find(body)
                        if (matcher != null) {
                            val otpObject = JSONObject()
                            otpObject.put("address", address)
                            otpObject.put("otp", matcher.value)
                            otpObject.put("body", body)
                            otpList.put(otpObject)
                        }
                    }
                }
            }

            promise.resolve(otpList.toString())
        } catch (e: Exception) {
            promise.reject("SMS_ERROR", e.message)
        }
    }
}
