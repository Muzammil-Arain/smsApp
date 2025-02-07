package com.smsapp

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.auth.api.identity.GetPhoneNumberHintIntentRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.common.api.ApiException

class HintRequestModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var promise: Promise? = null
    private val PHONE_HINT_REQUEST_CODE = 1001

    override fun getName(): String = "HintRequestModule"

    init {
        reactContext.addActivityEventListener(this)
    }

    @ReactMethod
    fun showHint(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity doesn't exist")
            return
        }

        this.promise = promise

        // Create a phone number hint request
        val request = GetPhoneNumberHintIntentRequest.builder().build()

        Identity.getSignInClient(activity)
            .getPhoneNumberHintIntent(request)
            .addOnSuccessListener { result ->
                try {
                    val intentSender: IntentSender = result.intentSender
                    activity.startIntentSenderForResult(
                        intentSender,
                        PHONE_HINT_REQUEST_CODE,
                        null,
                        0,
                        0,
                        0
                    )
                } catch (e: Exception) {
                    promise.reject("LAUNCH_ERROR", "Error launching hint request: ${e.message}")
                }
            }
            .addOnFailureListener { e ->
                promise.reject("HINT_REQUEST_FAILED", "Failure getting phone number: ${e.message}")
            }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == PHONE_HINT_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                try {
                    val phoneNumber = Identity.getSignInClient(reactContext)
                        .getPhoneNumberFromIntent(data)
                    promise?.resolve(phoneNumber)
                } catch (e: ApiException) {
                    promise?.reject("API_EXCEPTION", "Error fetching phone number: ${e.message}")
                }
            } else {
                promise?.reject("RESULT_FAILED", "Failed to retrieve phone number")
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // No-op
    }
}
