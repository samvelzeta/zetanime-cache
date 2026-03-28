import fs from "fs";
import fetch from "node-fetch";

const API = "https://zetapi-api.samvelzeta.workers.dev";
const API_KEY = "zetapi_super_secure_2026_v3lz3t4";

// ======================
// 🔥 CONFIG
// ======================ss
const MAX_EPISODES = 25;

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
// 🔥 OBTENER EPISODIOS
// ======================
async function getLatestEpisodes() {

  const json = await safeFetch(`${API}/api/list/latest-episodes`);

  if (!json) {
    console.log("❌ ERROR: API no respondió");
    return [];
  }

  console.log("📡 RESPUESTA API:", json);

  return json.data || [];
}

// ======================
// 🔥 CLASIFICAR STREAMS
// ======================
function classifyServers(servers) {

  const hls = [];
  const mp4 = [];
  const embed = [];

  for (const s of servers) {

    const url = (s.embed || "").toLowerCase();

    if (!url) continue;

    // 🧠 FILTRO SUAVE (NO AGRESIVO)
    if (
      url.includes("facebook") ||
      url.includes("twitter") ||
      url.includes(".css") ||
      url.includes(".js")
    ) continue;

    if (url.includes(".m3u8")) {
      hls.push(url);
    } else if (url.includes(".mp4")) {
      mp4.push(url);
    } else {
      embed.push(url);
    }
  }

  // 🔥 evitar duplicados
  return {
    hls: [...new Set(hls)],
    mp4: [...new Set(mp4)],
    embed: [...new Set(embed)]
  };
}

// ======================
// 🔥 GUARDAR CACHE PRO
// ======================
function saveCache(slug, number, lang, sources) {

  const dir = `data/${slug}`;
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(
    `${dir}/${number}-${lang}.json`,
    JSON.stringify({
      slug,
      episode: number,
      lang,
      sources,
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

  // 🔥 CLASIFICAR
  const sources = classifyServers(servers);

  // 🔥 evitar guardar basura total
  if (
    !sources.hls.length &&
    !sources.mp4.length &&
    !sources.embed.length
  ) return false;

  saveCache(slug, number, lang, sources);

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

  console.log("🚀 BOT PRO INICIADO");

  const latest = await getLatestEpisodes();

  let count = 0;

  for (const ep of latest) {

    if (count >= MAX_EPISODES) break;

    const slug = ep.slug;
    const number = ep.number;

    // 🥇 LATINO
    const latinoOk = await processEpisode(slug, number, "latino");

    // 🥈 SUB fallback
    if (!latinoOk) {
      await processEpisode(slug, number, "sub");
    }

    // 🔁 REINTENTO
    if (!latinoOk) {
      await retryEpisode(slug, number);
    }

    count++;
  }

  console.log("✅ BOT FINALIZADO");
}

run();
