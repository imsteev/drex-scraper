import _ from "lodash";
import type { Queen, Season } from "./types";
import { processShows } from "./scrape/scrapeShow";
import { processQueens } from "./scrape/scrapeQueens";

const BASE_FANDOM_URL = "https://rupaulsdragrace.fandom.com";

const SHOWS_TO_PROCESS = [
  {
    name: "RuPaul's Drag Race",
    numSeasons: 17,
  },
];

async function main() {
  console.log(`# of shows to process: ${SHOWS_TO_PROCESS.length}`);

  const totalSeasons = _.sumBy(SHOWS_TO_PROCESS, "numSeasons");

  console.log(`# of seasons to process: ${totalSeasons}\n`);
  const seasons: Season[] = [];
  await Promise.all(
    _.chunk(SHOWS_TO_PROCESS, 5).map(async (shows) => {
      const batchResults = await processShows(BASE_FANDOM_URL, shows);
      seasons.push(...batchResults);
    })
  );

  const uniqueQueens = _.uniqBy(
    seasons.flatMap((s) => s.contestants),
    "name"
  );

  console.log(`\n# of queens to process: ${uniqueQueens.length}\n`);
  const queens: Queen[] = [];
  await Promise.all(
    _.chunk(uniqueQueens, 50).map(async (qs) => {
      const batchResults = await processQueens(qs);
      queens.push(...batchResults);
    })
  );

  queens.sort((a, b) => a.name.localeCompare(b.name));

  await Bun.write("rpdr_queens.json", JSON.stringify(queens, null, 2));

  console.log("🎉 Extraction complete!");
  console.log(`   Saved to: rpdr_queens.json`);
}

main().catch(console.error);
