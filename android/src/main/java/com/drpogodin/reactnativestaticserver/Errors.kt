package com.drpogodin.reactnativestaticserver

import android.util.Log
import com.facebook.react.bridge.Promise

class Errors(val name: String, val message: String) {
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
        return "$LOGTAG:$name"
    }

    companion object {
        const val LOGTAG = "RN_STATIC_SERVER"

        fun ANOTHER_INSTANCE_IS_ACTIVE(
            activeServerId: Double,
            failedToLaunchServerId: Double
        ): Errors {
            return Errors(
                "ANOTHER_INSTANCE_IS_ACTIVE",
                "Failed to launch server #$failedToLaunchServerId, another server instance (#$activeServerId) is active.")
        }

        fun FAIL_GET_LOCAL_IP_ADDRESS(): Errors {
            return Errors(
                "FAIL_GET_LOCAL_IP_ADDRESS",
                "Failed to get local IP adddress"
            )
        }

        fun FAIL_GET_OPEN_PORT(): Errors {
            return Errors(
                "FAIL_GET_OPEN_PORT",
                "Failed to get an open port"
            )
        }

        fun INTERNAL_ERROR(serverId: Double): Errors {
            return Errors("INTERNAL_ERROR", "Internal error (server #$serverId)")
        }

        fun SERVER_CRASHED(serverId: Double): Errors {
            return Errors("SERVER_CRASHED", "Server #$serverId crashed")
        }

        fun STOP_FAILURE(serverId: Double): Errors {
            return Errors("STOP_FAILURE", "Failed to gracefully shutdown the server #$serverId")
        }
    }
}
