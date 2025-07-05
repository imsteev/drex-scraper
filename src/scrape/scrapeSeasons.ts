import type { Contestant, Series } from "../types";
import { fetchWithRetry } from "../utils";
import * as cheerio from "cheerio";

export async function processSeason(
  baseUrl: string,
  showName: string,
  season: number
): Promise<Series> {
  console.log(`Processing Season ${season}...`);

  const seasonUrl = `${baseUrl}/wiki/${showName.replace(
    " ",
    "_"
  )}_(Season_${season})`;

  const response = await fetchWithRetry(seasonUrl);

  const $seasonPage = cheerio.load(await response.text());
  const premiereYear = extractPremiereYear($seasonPage);
  const initialContestantsData = extractContestants($seasonPage, baseUrl);

  // Resolve final profile URL to address any name changes
  // For e.g, a contestant may be named "Bob" in S1, but on S2 they are named "Robert".
  // Visiting their latest profile page should always show their latest name.
  const finalContestantsData: Series["contestants"] = await Promise.all(
    initialContestantsData.map(async (contestant) => {
      const response = await fetchWithRetry(contestant.profileLink);
      return {
        name: contestant.name,
        profileLink: response.url,
      };
    })
  );

  console.log(
    `Season ${season}: Found ${finalContestantsData.length} contestants`
  );

  return {
    show: showName,
    season,
    year: premiereYear,
    contestants: finalContestantsData,
  };
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
