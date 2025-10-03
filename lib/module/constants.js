"use strict";

// Imports internal constants defined within the native layer,
// and exports user-facing constants for server states.

import ReactNativeStaticServer from "./NativeReactNativeStaticServer.js";
const CONSTANTS = ReactNativeStaticServer.getConstants();
export const IS_MAC_CATALYST = CONSTANTS.IS_MAC_CATALYST;
export const SIGNALS = {
  CRASHED: CONSTANTS.CRASHED,
  LAUNCHED: CONSTANTS.LAUNCHED,
  TERMINATED: CONSTANTS.TERMINATED
};
export let STATES = /*#__PURE__*/function (STATES) {
  STATES[STATES["ACTIVE"] = 0] = "ACTIVE";
  STATES[STATES["CRASHED"] = 1] = "CRASHED";
  STATES[STATES["INACTIVE"] = 2] = "INACTIVE";
  STATES[STATES["STARTING"] = 3] = "STARTING";
  STATES[STATES["STOPPING"] = 4] = "STOPPING";
  return STATES;
}({});
//# sourceMappingURL=constants.js.map