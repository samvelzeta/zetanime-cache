import fs from "fs";
import fetch from "node-fetch";

const API = "https://zetapi-api.samvelzeta.workers.dev";
const API_KEY = "zetapi_super_secure_2026_v3lz3t4";

// ======================
// 🔥 CONFIG
// ======================
const MAX_EPISODES = 25; // cuantos procesa por ciclo

// ======================
// 🔥 FETCH SEGURO
// ======================
async function safeFetch(url) {
  try {
    const res = await fetch(url, {
      headers: { "x-api-key": API_KEY }
    });
    return await res.json();
  } catch {
    return null;
  }
}

// ======================
// 🔥 OBTENER EPISODIOS NUEVOS
// ======================
async function getLatestEpisodes() {
  const json = await safeFetch(`${API}/api/list/latest-episodes`);
  return json?.data || [];
}

// ======================
// 🔥 GUARDAR CACHE
// ======================
function saveCache(slug, number, lang, servers) {

  const dir = `data/${slug}`;
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(
    `${dir}/${number}-${lang}.json`,
    JSON.stringify({
      slug,
      episode: number,
      lang,
      sources: servers,
      updated: Date.now()
    }, null, 2)
  );
}

// ======================
// 🔥 PROCESAR EPISODIO
// ======================
async function processEpisode(slug, number, lang) {

  const url = `${API}/api/anime/episode/${slug}/${number}?lang=${lang}`;

  const json = await safeFetch(url);

  const servers = json?.data?.servers || [];

  if (!servers.length) return false;

  saveCache(slug, number, lang, servers);

  console.log(`✔ ${slug} - ${number} (${lang})`);

  return true;
}

// ======================
// 🔥 REINTENTO
// ======================
async function retryEpisode(slug, number) {

  await processEpisode(slug, number, "latino");
  await processEpisode(slug, number, "sub");
}

// ======================
// 🔥 MAIN
// ======================
async function run() {

  console.log("🚀 BOT INICIADO");

  const latest = await getLatestEpisodes();

  let count = 0;

  for (const ep of latest) {

    if (count >= MAX_EPISODES) break;

    const slug = ep.slug;
    const number = ep.number;

    // 🔥 LATINO PRIMERO
    const latinoOk = await processEpisode(slug, number, "latino");

    // 🔥 SUB SI FALLA LATINO
    if (!latinoOk) {
      await processEpisode(slug, number, "sub");
    }

    // 🔥 REINTENTO
    if (!latinoOk) {
      await retryEpisode(slug, number);
    }

    count++;
  }

  console.log("✅ BOT FINALIZADO");
}

run();
