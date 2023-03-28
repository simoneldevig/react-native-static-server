#include "pch.h"

#include "Errors.h"

RNException::RNException(std::string && message) {
	this->Message = std::move(message);
}

const char* RNException::what() {
	return this->Message.c_str();
}

void RNException::reject(ReactPromise<React::JSValue>& promise) {
	promise.Reject(*this);
}
