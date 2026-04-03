import fs from "fs";
import { getAllServers } from "./server/utils/getServers";

// ======================
const MAX_EPISODES = 25;

// ======================
function classifyServers(servers) {

  const hls = [];
  const embed = [];

  for (const s of servers) {

    const url = (s.embed || "").toLowerCase();

    if (!url) continue;

    if (url.includes(".m3u8")) {
      hls.push(url);
    } else {
      embed.push(url);
    }
  }

  return {
    hls: [...new Set(hls)],
    embed: [...new Set(embed)]
  };
}

// ======================
function saveCache(slug, number, sources) {

  const dir = `data/${slug}`;
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(
    `${dir}/${number}-sub.json`,
    JSON.stringify({
      slug,
      episode: number,
      sources,
      updated: Date.now()
    }, null, 2)
  );
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

  // 🔥 SOLO GUARDAR SI HAY HLS
  if (!sources.hls.length) {
    console.log("⚠️ sin HLS, ignorado");
    return false;
  }

  saveCache(slug, number, sources);

  console.log("✅ guardado");

  return true;
}

// ======================
async function run() {

  console.log("🚀 BOT NUEVO");

  const testList = [
    { slug: "one-piece", number: 1 },
    { slug: "naruto", number: 1 },
    { slug: "attack-on-titan", number: 1 }
  ];

  for (const ep of testList) {
    await processEpisode(ep.slug, ep.number);
  }

  console.log("✅ FIN");
}

run();
