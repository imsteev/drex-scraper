import _ from "lodash";
import type { Queen } from "./types";
import { processSeason } from "./scrape/scrapeSeasons";
import { processQueens } from "./scrape/scrapeQueens";

const BASE_FANDOM_URL = "https://rupaulsdragrace.fandom.com";
const SHOW_NAME = "RuPaul's Drag Race";
const SEASONS_TO_PROCESS = 17; // as of 2025-07-04

async function main() {
  const seasons = await Promise.all(
    _.times(SEASONS_TO_PROCESS, (i) =>
      processSeason(BASE_FANDOM_URL, SHOW_NAME, i + 1)
    )
  );
  const uniqueQueens = _.uniqBy(
    seasons.flatMap((s) => s.contestants),
    "name"
  );

  const queens: Queen[] = [];
  for (const batch of _.chunk(uniqueQueens, 50)) {
    const batchResults = await processQueens(batch);
    queens.push(...batchResults);
  }

  queens.sort((a, b) => a.name.localeCompare(b.name));

  await Bun.write("rpdr_queens.json", JSON.stringify(queens, null, 2));

  console.log("🎉 Extraction complete!");
  console.log(`   Saved to: rpdr_queens.json`);
}

main().catch(console.error);
