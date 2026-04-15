import fetch from "node-fetch";

const API = "https://zetapi-api.samvelzeta.workers.dev";

async function run() {

  console.log("🚀 BOT KV");

  const animes = [
    "jujutsu-kaisen",
    "one-piece",
    "kimetsu-no-yaiba"
  ];

  for (const slug of animes) {

    for (let ep = 1; ep <= 5; ep++) {

      console.log(`🔍 ${slug} ep ${ep}`);

      try {

        const res = await fetch(
          `${API}/api/anime/episode/${slug}/${ep}?lang=sub`
        );

        const data = await res.json();

        if (data?.data?.servers?.length) {
          console.log("✔ OK");
        } else {
          console.log("❌ vacío");
        }

      } catch {
        console.log("error");
      }

      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

run();
