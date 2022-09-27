'use strict';

import fs from 'fs';
import fetch from 'node-fetch';
import rl from 'readline';
import 'dotenv/config';

fs.mkdirSync('./images', { recursive: true });

const islandCodes = fs.existsSync('./mapCodes.txt') ? fs.createReadStream('./mapCodes.txt') : false;

if (!islandCodes) console.log("No island code found.");
else {
    console.log("Reading island codes and downloading images...");
    rl.createInterface({
        input: islandCodes
    }).on('line', (rawICode) => {
        const iCode = rawICode.replace(/[?v=]/gi, '');
        if (iCode) getIsland(iCode);
    });
}

async function getIsland(iCode) {
    const req = await fetch(`https://fortniteapi.io/v1/creative/island?code=${iCode}`, {
        headers: {
            Authorization: process.env.API_TOKEN
        }
    });
    if (req.status === 429) {
        setTimeout(() => {
            getIsland(iCode);
        }, 100);
    } else if (req.ok) {
        const iData = await req.json();
        if (iData.island) {
            const imgLink = iData.island.image || iData.island.promotion_image;
            fetch(imgLink).then(res => res.body.pipe(fs.createWriteStream(`./images/${iCode}.png`)));
        } else console.log(`No island data found for "${iCode}"`);
    } else console.log(`An error ocurred when trying to fetch "${iCode}"`);
}
