'use strict';

import fs from 'fs';
import fetch from 'node-fetch';
import 'dotenv/config';

const islandCodes = fs.existsSync('./mapCodes.txt') ? fs.readFileSync('./mapCodes.txt').toString().split('\n') : [];

if (islandCodes.length === 0) {
    console.log("No island codes found.");
    process.exit();
}

if (fs.existsSync('./images')) fs.rmSync('./images', { recursive: true });
fs.mkdirSync('./images');

console.log('Reading island codes and downloading images...');
console.log(`${islandCodes.length} island codes found`);

for (const islandCode of islandCodes) {
    getIsland(islandCode);
}

async function getIsland(islandCode) {
    const res = await fetch(`https://fortniteapi.io/v1/creative/island?code=${islandCode.split('?')[0]}`, {
        headers: {
            Authorization: process.env.API_TOKEN
        }
    });
    if (res.status === 429) {
        console.log(`Ratelimited when getting "${islandCode}" data, trying again...`);
        setTimeout(() => getIsland(islandCode), 100);
    } else if (res.ok) {
        const islandData = await res.json();
        if (islandData.island) {
            const islandImage = await fetch(islandData.island.image || islandData.island.promotion_image);
            if (islandImage) {
                islandImage.body.pipe(fs.createWriteStream(`./images/${islandCode.replace('?', '_').replace('=', '')}.png`));
                console.log(`Saving island image for code "${islandCode}"`);
            } else console.log(`No island image found for code "${islandCode}", skipping`);
        } else console.log(`No island data found for code "${islandCode}", skipping`);
    } else console.log(`An error ocurred when trying to get island data for code "${islandCode}", skipping`);
}
