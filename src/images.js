"use strict";

import fs from "fs";
import fetch from "node-fetch";
import "dotenv/config";

const islandCodes = fs.existsSync("./mapCodes.txt")
  ? fs.readFileSync("./mapCodes.txt").toString().split("\n")
  : [];

if (islandCodes.length === 0) {
  console.log("No island codes found.");
  process.exit();
}

if (fs.existsSync("./images")) fs.rmSync("./images", { recursive: true });
fs.mkdirSync("./images");

console.log("Reading island codes and downloading images...");
console.log(`${islandCodes.length} island codes found`);

for (const islandCode of islandCodes) {
  getIsland(islandCode);
}

async function getIsland(islandCode, retry = 0) {
  try {
    const res = await fetch(
      `https://fortniteapi.io/v1/creative/island?code=${
        islandCode.split("?")[0]
      }`,
      {
        headers: {
          Authorization: process.env.API_TOKEN,
        },
      }
    );
    if (res.status === 429) {
      retry++;
      if (retry > 50)
        return console.log(
          `Max rate limit tries reached when fetching "${islandCode}" data, skipping.`
        );
      console.log(
        `Ratelimited when fetching "${islandCode}" data, trying again (${retry}/50)...`
      );
      setTimeout(() => getIsland(islandCode, retry), 250);
    } else if (res.ok) {
      const islandData = await res.json();
      if (islandData.island) {
        const islandImage = await fetch(
          islandData.island.image || islandData.island.promotion_image
        );
        if (islandImage) {
          islandImage.body.pipe(
            fs.createWriteStream(
              `./images/${islandCode.replace("?", "_").replace("=", "")}.png`
            )
          );
          console.log(`Saving island image for code "${islandCode}"`);
        } else
          console.log(
            `No island image found for code "${islandCode}", skipping.`
          );
      } else
        console.log(`No island data found for code "${islandCode}", skipping.`);
    } else
      console.log(
        `An error ocurred when trying to get island data for code "${islandCode}", skipping.`
      );
  } catch (e) {
    retry++;
    if (retry > 3)
      return console.log(
        `Max attempts reached when fetching "${islandCode}" data, skipping.`
      );
    console.log(
      `Unexpected error when fetching "${islandCode}" data, trying again (${retry}/3)...`
    );
    setTimeout(() => getIsland(islandCode, retry), 100);
  }
}
