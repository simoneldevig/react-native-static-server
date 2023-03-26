#include <exception>
#include <string>

#include "NativeModules.h"

using namespace winrt::Microsoft::ReactNative;

class RNException : public std::exception, public ReactError {
public:
	// TODO: ReactError also has Code (string) and UserInfo (JSValueObject)
	// fields, we may accept here, and use. For now, just getting message is ok.
	RNException(std::string && message);

	virtual const char* what();
	void reject(ReactPromise<React::JSValue>& promise);
};
