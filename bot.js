import fs from "fs";
import fetch from "node-fetch";

const API = "https://zetapi-api.samvelzeta.workers.dev";

// ======================
const MAX_EPISODES = 25;

// ======================
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch {
    return null;
  }
}

// ======================
async function getLatestEpisodes() {

  const json = await safeFetch(`${API}/api/list/latest-episodes`);

  if (!json) {
    console.log("❌ API no respondió");
    return [];
  }

  return json.data || [];
}

// ======================
function classifyServers(servers) {

  const hls = [];
  const mp4 = [];
  const embed = [];

  for (const s of servers) {

    const url = (s.embed || "").toLowerCase();

    if (!url) continue;

    if (
      url.includes("facebook") ||
      url.includes("twitter") ||
      url.includes(".css") ||
      url.includes(".js")
    ) continue;

    if (url.includes(".m3u8")) hls.push(url);
    else if (url.includes(".mp4")) mp4.push(url);
    else embed.push(url);
  }

  return {
    hls: [...new Set(hls)],
    mp4: [...new Set(mp4)],
    embed: [...new Set(embed)]
  };
}

// ======================
// 🔥 GUARDAR EN GITHUB (IGUAL QUE ANTES)
// ======================
async function saveCache(slug, number, lang, sources) {

  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.log("❌ NO TOKEN");
    return;
  }

  const path = `data/${slug}/${number}-${lang}.json`;

  const apiUrl = `https://api.github.com/repos/samvelzeta/zetanime-cache/contents/${path}`;

  let sha = null;

  const existing = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (existing.ok) {
    const data = await existing.json();
    sha = data.sha;
  }

  const payload = {
    sources,
    updated: Date.now()
  };

  await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `update ${slug} ep ${number}`,
      content: Buffer.from(JSON.stringify(payload, null, 2)).toString("base64"),
      sha
    })
  });

  console.log(`💾 guardado ${slug} ep ${number}`);
}

// ======================
async function processEpisode(slug, number) {

  console.log(`🔍 ${slug} - ${number}`);

  // 🔥 FIX SLUG
  const cleanSlug = slug.replace(/-\d+$/, "");

  const url = `${API}/api/anime/episode/${cleanSlug}/${number}?lang=sub`;

  const json = await safeFetch(url);

  const servers = json?.data?.servers || [];

  if (!servers.length) {
    console.log("❌ sin servers");
    return false;
  }

  const sources = classifyServers(servers);

  await saveCache(cleanSlug, number, "sub", sources);

  return true;
}

  // 🔥 GUARDA TODO (como pediste)
  await saveCache(slug, number, "sub", sources);

  return true;
}

// ======================
async function run() {

  console.log("🚀 BOT CACHE REAL");

  const latest = await getLatestEpisodes();

  let count = 0;

  for (const ep of latest) {

    if (count >= MAX_EPISODES) break;

    const ok = await processEpisode(ep.slug, ep.number);

    if (!ok) {
      console.log("🔁 retry...");
      await processEpisode(ep.slug, ep.number);
    }

    count++;
  }

  console.log("✅ BOT TERMINADO");
}

run();
