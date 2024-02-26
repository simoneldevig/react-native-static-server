#pragma once

#include <string>

namespace winrt::ReactNativeStaticServer {

	static const std::string CRASHED = "CRASHED";
	static const std::string LAUNCHED = "LAUNCHED";
	static const std::string TERMINATED = "TERMINATED";

	typedef void (*SignalConsumer)(std::string signal, std::string details);

	class Server {
	public:
		Server(
      double id,
			std::string configPath,
			std::string errlogPath,
			SignalConsumer signalConsumer);

    inline double id() { return _id; }
    inline std::string id_str() { return std::to_string(_id); }

		void launch();
		void shutdown();
	private:
    double _id;
		std::string _configPath;
		std::string _errlogPath;
		SignalConsumer _signalConsumer;

		static Server* activeServer;

		static void OnLaunchedCallback();
	};

} // namespace winrt::ReactNativeStaticServer
