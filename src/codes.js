'use strict';

import fs from 'fs';
import replayReader from 'fortnite-replay-parser';

import handleEventEmitter from './Exports/handleEventEmitter.js';
import MatchmakingPortalNetField from './NetFieldExports/MatchmakingPortal.js';

const replayFiles = fs.existsSync('./replays') ? fs.readdirSync("./replays").filter((i) => i.endsWith('.replay')) : [];
if (replayFiles.length === 0) {
    console.log('No replay files found. Place your replay files inside the "replays" folder');
    if (!fs.existsSync('./replays')) fs.mkdirSync('./replays');
    process.exit();
}

console.log("Reading replay files and extracting matchmaking codes...");
console.time('Done');

let portalCodes = [];
for (const replayFile of replayFiles) {

    try {
        const replayBinary = fs.readFileSync(`./replays/${replayFile}`);

        const replayData = await replayReader(replayBinary, {
            handleEventEmitter,
            onlyUseCustomNetFieldExports: true,
            customNetFieldExports: [
                MatchmakingPortalNetField
            ]
        });

        portalCodes.push(...replayData.NetFieldData.MatchmakingPortals);
    } catch (err) {
        console.log(`ERROR: "${replayFile}" - ${err.message}`);
    }
}

portalCodes = portalCodes.filter((v, i, a) => a.indexOf(v) === i);
console.log(`\nTotal unique codes: ${portalCodes.length}`);

fs.writeFileSync('mapCodes.txt', portalCodes.join('\n'));
console.timeEnd('Done');
