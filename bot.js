import { getAllServers } from "./server/utils/getServers.js";
import { saveCache } from "./server/utils/cache.js";

// ======================
const MAX_EPISODES = 25;

// ======================
function classifyServers(servers) {

  const hls = [];
  const mp4 = [];
  const embed = [];

  for (const s of servers) {

    const url = (s.embed || "").toLowerCase();

    if (!url) continue;

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
async function processEpisode(slug, number) {

  console.log(`🔍 ${slug} - ${number}`);

  const servers = await getAllServers({
    slug,
    number,
    title: slug,
    lang: "sub"
  });

  if (!servers.length) {
    console.log("❌ sin servers");
    return false;
  }

  const sources = classifyServers(servers);

  // 🔥 AHORA GUARDA TODO (no solo HLS)
  await saveCache(slug, number, "sub", servers);

  console.log("✅ guardado en cache");

  return true;
}

// ======================
async function run() {

  console.log("🚀 BOT PRO REAL");

  const testList = [
    { slug: "one-piece", number: 1 },
    { slug: "naruto", number: 1 },
    { slug: "shingeki-no-kyojin", number: 1 },
    { slug: "kimetsu-no-yaiba", number: 1 }
  ];

  for (const ep of testList) {
    await processEpisode(ep.slug, ep.number);
  }

  console.log("✅ BOT FINALIZADO");
}

run();
