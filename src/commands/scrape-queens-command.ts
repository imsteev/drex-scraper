import type { Queen, Season } from "../types";
import _ from "lodash";
import { processQueens } from "../scrape/scrapeQueens";
import { processShows } from "../scrape/scrapeShows";

class ScrapeQueensCommand {
  private shows: string[];

  constructor(private readonly baseUrl: string, shows: string[]) {
    this.shows = shows;
  }

  async execute() {
    console.log(`# of shows to process: ${this.shows.length}\n`);
    const seasons: Season[] = [];
    await Promise.all(
      _.chunk(this.shows, 5).map(async (shows) => {
        const batchResults = await processShows(this.baseUrl, shows);
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

    return queens;
  }
}

export default ScrapeQueensCommand;
