import type { Contestant, Season } from "../types";
import { fetchWithRetry } from "../utils";
import * as cheerio from "cheerio";
import _ from "lodash";

export async function processShows(
  baseUrl: string,
  shows: { name: string; numSeasons: number }[]
): Promise<Season[]> {
  const seasons = _.flatten(
    await Promise.all(
      shows.map(async (show) => processSeasonsForShow(baseUrl, show))
    )
  );
  seasons.forEach((s) => {
    console.log(
      `${s.show} Season ${s.season}: ${s.contestants.length} contestants found`
    );
  });
  return seasons;
}

async function processSeasonsForShow(
  baseUrl: string,
  show: {
    name: string;
    numSeasons: number;
  }
): Promise<Season[]> {
  const seasonPromises = _.times(show.numSeasons, async (n) => {
    const i = n + 1;
    const seasonUrl = `${baseUrl}/wiki/${show.name.replace(
      " ",
      "_"
    )}_(Season_${i})`;

    const response = await fetchWithRetry(seasonUrl);

    const $seasonPage = cheerio.load(await response.text());
    const premiereYear = extractPremiereYear($seasonPage);
    const initialContestantsData = extractContestants($seasonPage, baseUrl);

    // Resolve final profile URL to address any name changes
    // For e.g, a contestant may be named "Bob" in S1, but on S2 they are named "Robert".
    // Visiting their latest profile page should always show their latest name.
    const finalContestantsData: Season["contestants"] = await Promise.all(
      initialContestantsData.map(async (contestant) => {
        const response = await fetchWithRetry(contestant.profileLink);
        return {
          name: contestant.name,
          profileLink: response.url,
        };
      })
    );

    return {
      show: show.name,
      season: i,
      year: premiereYear,
      contestants: finalContestantsData,
    };
  });

  return Promise.all(seasonPromises);
}

function extractPremiereYear($seasonPage: cheerio.CheerioAPI): number {
  const premiereText = $seasonPage('[data-source="premiere"] .pi-data-value')
    .text()
    .trim();
  const yearMatch = premiereText.match(/(\d{4})/);
  return parseInt(yearMatch?.[1] ?? "0", 10);
}

function extractContestants(
  $seasonPage: cheerio.CheerioAPI,
  baseUrl: string // used to construct links relative to root domain
): Contestant[] {
  const contestants: Contestant[] = [];
  $seasonPage("table").each((_, table) => {
    const hasRankHeader = $seasonPage(table).find("th").text().includes("Rank");

    if (hasRankHeader) {
      $seasonPage(table)
        .find("tr")
        .each((_, row) => {
          // Skip header rows
          if ($seasonPage(row).find("th").length > 0) return;

          $seasonPage(row)
            .find('td b a[href*="/wiki/"]')
            .each((_, el) => {
              const link = $seasonPage(el);
              contestants.push({
                name: link.text().trim(),
                profileLink: `${baseUrl}${link.attr("href") || ""}`,
              });
            });
        });
    }
  });

  return contestants;
}
