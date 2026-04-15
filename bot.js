import fetch from "node-fetch";

const API = "https://zetapi-api.samvelzeta.workers.dev";

async function fetchEpisode(slug, ep, lang) {
  try {

    const res = await fetch(
      `${API}/api/anime/episode/${slug}/${ep}?lang=${lang}`
    );

    const data = await res.json();

    if (data?.data?.servers?.length) {
      console.log(`✔ ${slug} ep ${ep} [${lang}]`);
    } else {
      console.log(`❌ vacío ${slug} ep ${ep} [${lang}]`);
    }

  } catch (e) {
    console.log("error:", slug, ep, lang);
  }
}

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

      await fetchEpisode(slug, ep, "sub");
      await fetchEpisode(slug, ep, "latino");

      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

run();
