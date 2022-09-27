'use strict';

import fs from 'fs';
import replayReader from 'fortnite-replay-parser';

fs.mkdirSync('./replays', { recursive: true });

const replayFiles = fs.readdirSync("./replays").filter((i) => i.endsWith('.replay'));

if (replayFiles.length === 0) {
    console.log("No replay file found.");
} else {
    console.log("Reading replay files and extracting matchmaking codes...");
    let mapCodes = '';
    let matchmakingPortals = [];
    for (const replayFile of replayFiles) {
        const replayBinary = fs.readFileSync(`./replays/${replayFile}`);
        matchmakingPortals.push(...(await replayReader(replayBinary, {
            handleEventEmitter: ({ propertyExportEmitter }) => {
                propertyExportEmitter.on('BP_Creative_MatchmakingPortal.BP_Creative_MatchmakingPortal_C', ({ data, result }) => {
                    result.mapData.MMPortal.push(data.WellKnownNameCode);
                });
            },
            onlyUseCustomNetFieldExports: true,
            customNetFieldExports: [
                {
                    path: ['/Game/Creative/Devices/MatchmakingPortal/BP_Creative_MatchmakingPortal.BP_Creative_MatchmakingPortal_C'],
                    exportName: 'MMPortal',
                    exportGroup: 'mapData',
                    exportType: 'array',
                    parseLevel: 1,
                    properties: {
                        WellKnownNameCode: {
                            name: 'WellKnownNameCode',
                            type: 'DebugObject',
                            parseType: 'readClass'
                        }
                    }
                }
            ]
        })).mapData.MMPortal
        );
    }
    JSON.parse(JSON.stringify(matchmakingPortals)).map((i) => i.string).filter((v, i, a) => a.indexOf(v) === i).forEach((i) => mapCodes += `${i}\n`);
    fs.writeFileSync('mapCodes.txt', mapCodes);
    console.log('Done');
}
