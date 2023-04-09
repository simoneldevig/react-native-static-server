#pragma once

#include <string>

namespace winrt::ReactNativeStaticServer {

	static const std::string CRASHED = "CRASHED";
	static const std::string LAUNCHED = "LAUNCHED";
	static const std::string TERMINATED = "TERMINATED";

	typedef void (*SignalConsumer)(std::string signal, std::string details);

	class Server {
	public:
		Server(std::string configPath, SignalConsumer signalConsumer);
		void launch();
		void shutdown();
	private:
		std::string _configPath;
		SignalConsumer _signalConsumer;

		static Server* activeServer;

		static void OnLaunchedCallback();
	};

} // namespace winrt::ReactNativeStaticServer
