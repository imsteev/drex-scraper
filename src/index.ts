import _ from "lodash";
import type { Contestant } from "./types";
import { processSeason } from "./scrape/scrapeSeasons";
import { batchProcessContestants } from "./scrape/scrapeContestants";

const BASE_FANDOM_URL = "https://rupaulsdragrace.fandom.com";
const SHOW_NAME = "RuPaul's Drag Race";
const SEASONS_TO_PROCESS = 17; // as of 2025-07-04

async function main() {
  const seasons = await Promise.all(
    _.times(SEASONS_TO_PROCESS, (i) =>
      processSeason(BASE_FANDOM_URL, SHOW_NAME, i + 1)
    )
  );
  const uniqueContestants = _.uniqBy(
    seasons.flatMap((s) => s.contestants),
    "name"
  );

  const contestantDetails: Contestant[] = [];
  for (const batch of _.chunk(uniqueContestants, 50)) {
    const batchResults = await batchProcessContestants(batch);
    contestantDetails.push(...batchResults);
  }

  contestantDetails.sort((a, b) => a.name.localeCompare(b.name));

  await Bun.write(
    "rpdr_contestants.json",
    JSON.stringify(contestantDetails, null, 2)
  );

  console.log("🎉 Extraction complete!");
  console.log(`   Saved to: rpdr_contestants.json`);
}

main().catch(console.error);
