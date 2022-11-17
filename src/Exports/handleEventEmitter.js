"use strict";

import replayReader from "fortnite-replay-parser";

import handleMatchmakingPortal from "./propertyExports/handleMatchmakingPortal.js";

/**
 * @param {replayReader.EventEmittersObject} param0
 */
export default ({ propertyExportEmitter }) => {
  propertyExportEmitter.on(
    "BP_Creative_MatchmakingPortal.BP_Creative_MatchmakingPortal_C",
    handleMatchmakingPortal
  );
};
