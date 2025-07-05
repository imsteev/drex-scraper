import ScrapeQueensCommand from "./commands/scrape-queens-command";

async function main() {
  const queens = await new ScrapeQueensCommand({
    shows: ["RuPaul's Drag Race"],
  }).execute();

  await Bun.write("rpdr_queens.json", JSON.stringify(queens, null, 2));

  console.log("🎉 Extraction complete!");
  console.log(`   Saved to: rpdr_queens.json`);
}

main().catch(console.error);
