package com.smsapp

import android.annotation.SuppressLint
import android.app.Activity
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.result.IntentSenderRequest
import com.facebook.react.bridge.*
import com.google.android.gms.auth.api.identity.GetPhoneNumberHintIntentRequest
import com.google.android.gms.auth.api.identity.Identity

class PhoneNumberModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var promise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "PhoneNumberModule"
    }

    @ReactMethod
    fun requestPhoneNumber(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ERROR", "Activity is null. Ensure app is not in background.")
            return
        }

        val request = GetPhoneNumberHintIntentRequest.builder().build()

        Identity.getSignInClient(activity)
            .getPhoneNumberHintIntent(request)
            .addOnSuccessListener { result: PendingIntent ->
                try {
                    activity.startIntentSenderForResult(
                        result.intentSender,
                        PHONE_NUMBER_REQUEST_CODE,
                        null, 0, 0, 0
                    )
                } catch (e: Exception) {
                    promise.reject("ERROR", "Launching PendingIntent failed: ${e.message}")
                }
            }
            .addOnFailureListener { e ->
                promise.reject("ERROR", "Phone Number Hint failed: ${e.message}")
            }
    }

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == PHONE_NUMBER_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            try {
                val phoneNumber = Identity.getSignInClient(activity).getPhoneNumberFromIntent(data)
                promise?.resolve(phoneNumber ?: "No number found")
            } catch (e: Exception) {
                promise?.reject("ERROR", "Phone Number Hint failed")
            }
        }
    }

    @SuppressLint("MissingPermission")
    @ReactMethod
    fun checkPhoneNumberAvailability(promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("ERROR", "Activity is null")
            return
        }

        val telephonyManager = activity.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
        val simState = telephonyManager.simState
        val phoneNumber = telephonyManager.line1Number // Might be empty on some devices

        val result = "SIM State: $simState, Phone Number: $phoneNumber"

        promise.resolve(result)
    }


    override fun onNewIntent(intent: Intent?) {}

    companion object {
        private const val PHONE_NUMBER_REQUEST_CODE = 1001
    }
}
