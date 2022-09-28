'use strict';

import replayReader from 'fortnite-replay-parser';

let totalCodesFound = 0;
/**
 * @param {replayReader.PropertyExport} param0
 */
export default ({ data, result }) => {
    totalCodesFound++;
    process.stdout.write('Total island codes found: ' + totalCodesFound + '\r');
    result.NetFieldData.MatchmakingPortals.push(data.WellKnownNameCode);
};
