"use strict";

import replayReader from "fortnite-replay-parser";

/**
 * @type {replayReader.NetFieldExport}
 */
export default {
  path: [
    "/Game/Creative/Devices/MatchmakingPortal/BP_Creative_MatchmakingPortal.BP_Creative_MatchmakingPortal_C"
  ],
  exportName: "MatchmakingPortals",
  exportGroup: "NetFieldData",
  exportType: "array",
  parseLevel: 1,
  properties: {
    WellKnownNameCode: {
      name: "WellKnownNameCode",
      parseFunction: "readString",
      parseType: "default"
    }
  }
};
