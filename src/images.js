"use strict";

import { WritableStream } from "stream/web";
import fs from "fs";
import "dotenv/config";

const islandCodes = fs.existsSync("./mapCodes.txt")
  ? fs.readFileSync("./mapCodes.txt").toString().split("\n")
  : [];

if (islandCodes.length === 0) {
  console.log("No island codes found.");
  process.exit();
}

if (!fs.existsSync("./images")) fs.mkdirSync("./images");
else {
  const imageFiles = fs.readdirSync("./images").filter((i) => i.endsWith(".png"));
  if (imageFiles.length > 0 && !fs.existsSync("./images/previous")) fs.mkdirSync("./images/previous");
  for (const imageFile of imageFiles) fs.renameSync(`./images/${imageFile}`, `./images/previous/${imageFile}`);
}

console.log("Reading island codes and downloading images...");
console.log(`${islandCodes.length} island codes found`);

class normalizedIslandCode {
  constructor(rawIslandCode) {
    const [rawCode, firstPart, middlePart, lastPart, version] = rawIslandCode.match(/([0-9]{4})-*([0-9]{4})-*([0-9]{4})\?*[v=]*([0-9]*)/);
    this.rawCode = rawCode;
    this.firstPart = firstPart;
    this.middlePart = middlePart;
    this.lastPart = lastPart;
    this.version = version || null;
  }

  get normalizedCode() {
    return `${this.firstPart}-${this.middlePart}-${this.lastPart}`
  }

  get friendlyName() {
    return `${this.normalizedCode}${!this.version ? '' : 'v' + this.version}`
  }
}

for (const rawICode of islandCodes) {
  if (rawICode.length < 12) continue;
  getIsland(new normalizedIslandCode(rawICode));
}

async function getIsland(icodeData, retry = 0) {
  try {
    const res = await fetch(`https://fortniteapi.io/v1/creative/island?code=${icodeData.normalizedCode}&version=${icodeData.version}`, {
      headers: {
        Authorization: process.env.API_TOKEN
      }
    });
    if (res.status === 429) {
      retry++;
      if (retry > 50) return console.log(`Max rate limit tries reached when fetching "${icodeData.friendlyName}" data, skipping.`);
      console.log(`Ratelimited when fetching "${icodeData.friendlyName}" data, trying again (${retry}/50)...`);
      setTimeout(() => getIsland(icodeData, retry), 250);
    } else if (res.ok) {
      const islandData = await res.json();
      if (islandData.island) {
        if (!icodeData.version) icodeData.version = islandData.island.latestVersion;
        const islandImage = await fetch(islandData.island.image || islandData.island.promotion_image);
        if (islandImage) {
          const imageSavePath = fs.createWriteStream(`./images/${icodeData.friendlyName}.png`);
          const localWritableStream = new WritableStream({
            write(chunk) {
              imageSavePath.write(chunk);
            },
          });
          await islandImage.body.pipeTo(localWritableStream)
          console.log(`Saving island image for code "${icodeData.friendlyName}"`);
        } else console.log(`No island image found for code "${icodeData.friendlyName}", skipping.`);
      } else console.log(`No island data found for code "${icodeData.friendlyName}", skipping.`);
    } else
      console.log(`An error ocurred when trying to get island data for code "${icodeData.friendlyName}", skipping.`);
  } catch (e) {
    retry++;
    if (retry > 5) return console.log(`Max attempts reached when fetching "${icodeData.friendlyName}" data, skipping.`);
    console.log(`Unexpected error when fetching "${icodeData.friendlyName}" data, trying again (${retry}/5)...`);
    setTimeout(() => getIsland(icodeData, retry), 100);
  }
}
