import fs from "fs";
import fetch from "node-fetch";

const API = "https://zetapi-api.samvelzeta.workers.dev";
const API_KEY = "zetapi_super_secure_2026_v3lz3t4";

// ======================
// 🔥 OBTENER EPISODIOS
// ======================
async function getLatestEpisodes() {
  try {
    const res = await fetch(`${API}/api/list/latest-episodes`, {
      headers: {
        "x-api-key": API_KEY
      }
    });

    const json = await res.json();

    return json?.data || [];
  } catch {
    return [];
  }
}

// ======================
// 🔥 GUARDAR CACHE
// ======================
function saveCache(slug, number, servers) {

  const dir = `data/${slug}`;
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(
    `${dir}/${number}.json`,
    JSON.stringify({
      slug,
      episode: number,
      sources: servers,
      updated: Date.now()
    }, null, 2)
  );
}

// ======================
// 🔥 PROCESAR EPISODIOS
// ======================
async function processEpisode(ep) {

  const slug = ep.slug;
  const number = ep.number;

  try {

    const res = await fetch(
      `${API}/api/anime/episode/${slug}/${number}?lang=latino`,
      {
        headers: {
          "x-api-key": API_KEY
        }
      }
    );

    const json = await res.json();

    const servers = json?.data?.servers || [];

    if (!servers.length) return;

    saveCache(slug, number, servers);

    console.log(`✔ ${slug} - ${number}`);

  } catch (err) {
    console.log(`❌ error ${slug} ${number}`);
  }
}

// ======================
// 🔥 MAIN
// ======================
async function run() {

  const latest = await getLatestEpisodes();

  for (const ep of latest.slice(0, 20)) {
    await processEpisode(ep);
  }

}

run();
