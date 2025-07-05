import _ from "lodash";
import type { Queen, Season } from "./types";
import { processShow } from "./scrape/scrapeShow";
import { processQueens } from "./scrape/scrapeQueens";

const BASE_FANDOM_URL = "https://rupaulsdragrace.fandom.com";

async function main() {
  const SHOWS_TO_PROCESS = [
    {
      name: "RuPaul's Drag Race",
      numSeasons: 17,
    },
  ];

  console.log(`# of shows to process: ${SHOWS_TO_PROCESS.length}`);
  console.log(
    `# of seasons to process: ${_.sumBy(SHOWS_TO_PROCESS, "numSeasons")}\n`
  );

  const seasons: Season[] = [];
  await Promise.all(
    _.chunk(SHOWS_TO_PROCESS, 5).map(async (batch) => {
      for (const show of batch) {
        const showSeasons = await processShow(BASE_FANDOM_URL, show);
        showSeasons.forEach((s) => {
          console.log(
            `${show.name} Season ${s.season}: ${s.contestants.length} contestants found`
          );
        });
        seasons.push(...showSeasons);
      }
    })
  );

  const uniqueQueens = _.uniqBy(
    seasons.flatMap((s) => s.contestants),
    "name"
  );

  console.log(`\n# of queens to process: ${uniqueQueens.length}\n`);
  const queens: Queen[] = [];
  await Promise.all(
    _.chunk(uniqueQueens, 50).map(async (batch) => {
      const batchResults = await processQueens(batch);
      queens.push(...batchResults);
    })
  );

  queens.sort((a, b) => a.name.localeCompare(b.name));

  await Bun.write("rpdr_queens.json", JSON.stringify(queens, null, 2));

  console.log("🎉 Extraction complete!");
  console.log(`   Saved to: rpdr_queens.json`);
}

main().catch(console.error);
