import ScrapeQueensCommand from "./commands/scrape-queens-command";

const BASE_FANDOM_URL = "https://rupaulsdragrace.fandom.com";
const SHOWS_TO_PROCESS = ["RuPaul's Drag Race"];

async function main() {
  const queens = await new ScrapeQueensCommand(
    BASE_FANDOM_URL,
    SHOWS_TO_PROCESS
  ).execute();

  await Bun.write("rpdr_queens.json", JSON.stringify(queens, null, 2));

  console.log("🎉 Extraction complete!");
  console.log(`   Saved to: rpdr_queens.json`);
}

main().catch(console.error);
