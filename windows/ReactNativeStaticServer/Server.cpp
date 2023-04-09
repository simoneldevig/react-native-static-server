#include "pch.h"
#include "Server.h"
#include <ppltasks.h>

using namespace winrt::ReactNativeStaticServer;
using namespace winrt::Windows::ApplicationModel;
using namespace winrt::Windows::Storage;

typedef void (*CallbackT)();
typedef int (*LighttpdLaunchT)(const char *configPath, const char *modulesPath, CallbackT);
typedef void (*LighttpdShutdownT)();

LighttpdLaunchT LighttpdLaunch;
LighttpdShutdownT LighttpdShutdown;

Server* Server::activeServer;

void LoadLighttpdDll() {
    LoadPackagedLibrary(L"ReactNativeStaticServer\\libpcre2-8.dll", 0);
    LoadPackagedLibrary(L"ReactNativeStaticServer\\libwinpthread-1.dll", 0);
    HMODULE dll = LoadPackagedLibrary(L"ReactNativeStaticServer\\lighttpd.dll", 0);
    if (dll) {
        LighttpdLaunch = (LighttpdLaunchT)GetProcAddress(dll, "lighttpd_launch");
        LighttpdShutdown = (LighttpdShutdownT)GetProcAddress(dll, "lighttpd_graceful_shutdown");
    }
    else {
        // The DLLs we tried to import above are pre-build and bundled into
        // an UWP app by this library, so failure to locate and load them is
        // a fatal crash, meaning there is something wrong with our library,
        // and we terminate the app in such case.
        terminate();
    }
}

void Server::OnLaunchedCallback() {
    Server::activeServer->_signalConsumer(LAUNCHED, "");
}

Server::Server(std::string configPath, SignalConsumer signalConsumer):
    _configPath(configPath),
    _signalConsumer(signalConsumer)
{
     if (!LighttpdLaunch) LoadLighttpdDll();
}

void Server::launch() {
    concurrency::task task = concurrency::create_task(
        [this] {
            if (Server::activeServer) {
                // Bail out with error if another server instance is running.
                this->_signalConsumer(CRASHED, "Another Server instance is active");
                return;
            }
            winrt::hstring appPath = Package::Current().InstalledLocation().Path();
            std::string modulesPath(appPath.begin(), appPath.end());
            modulesPath += "\\ReactNativeStaticServer";
            try {
                Server::activeServer = this;
                int res = LighttpdLaunch(
                    this->_configPath.c_str(),
                    modulesPath.c_str(),
                    Server::OnLaunchedCallback
                );
                if (res) {
                    throw new std::exception("Ligttpd exited with status " + res);
                }
                this->_signalConsumer(TERMINATED, "");
            }
            catch (...) {
                this->_signalConsumer(CRASHED, "");
            }
            Server::activeServer = NULL;
        }
    );
}

void Server::shutdown() {
    LighttpdShutdown();
}
