package com.drpogodin.reactnativestaticserver

import android.util.Log
import com.facebook.react.bridge.Promise

enum class Errors(val message: String) {
    ANOTHER_INSTANCE_IS_ACTIVE(
            "Failed to launch, another server instance is active."),
    FAIL_GET_LOCAL_IP_ADDRESS("Failed to get local IP adddress"),
    FAIL_GET_OPEN_PORT("Failed to get an open port"),
    INTERNAL_ERROR("Internal error"),
    SERVER_CRASHED("Server crashed"),
    STOP_FAILURE("Failed to gracefully shutdown the server");

    val error: Error
        get() = Error(message)
    val exception: Exception
        get() = Exception(message)

    fun log(): Errors {
        Log.e(LOGTAG, message)
        return this
    }

    fun log(e: Exception): Errors {
        Log.e(LOGTAG, e.toString())
        return this.log()
    }

    fun reject(promise: Promise?) {
        promise?.reject(this.toString(), message, error)
    }

    fun reject(promise: Promise?, details: String?) {
        if (promise != null) {
            var message = message
            if (details != null) message += ": $details"
            promise.reject(this.toString(), message, error)
        }
    }

    override fun toString(): String {
        return LOGTAG + ":" + name
    }

    companion object {
        const val LOGTAG = "RN_STATIC_SERVER"
    }
}
