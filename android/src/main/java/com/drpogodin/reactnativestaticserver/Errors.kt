package com.drpogodin.reactnativestaticserver

import android.util.Log
import com.facebook.react.bridge.Promise

class Errors(val name: String, val message: String) {
    val error: Error
        get() = Error(message)
    val exception: Exception
        get() = Exception(message)

    fun log(): Errors {
        Log.e(LOG_TAG, message)
        return this
    }

    fun log(e: Exception): Errors {
        Log.e(LOG_TAG, e.toString())
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
        return "$LOG_TAG:$name"
    }

    companion object {
        const val LOG_TAG = "RN_STATIC_SERVER"

        fun anotherInstanceIsActive(
            activeServerId: Double,
            failedToLaunchServerId: Double
        ): Errors {
            return Errors(
                "ANOTHER_INSTANCE_IS_ACTIVE",
                "Failed to launch server #$failedToLaunchServerId, another server instance (#$activeServerId) is active.")
        }

        fun failGetLocalIpAddress(): Errors {
            return Errors(
                "FAIL_GET_LOCAL_IP_ADDRESS",
                "Failed to get local IP address"
            )
        }

        fun failGetOpenPort(): Errors {
            return Errors(
                "FAIL_GET_OPEN_PORT",
                "Failed to get an open port"
            )
        }

        fun internalError(serverId: Double): Errors {
            return Errors("INTERNAL_ERROR", "Internal error (server #$serverId)")
        }

        fun serverCrashed(serverId: Double): Errors {
            return Errors("SERVER_CRASHED", "Server #$serverId crashed")
        }
    }
}
