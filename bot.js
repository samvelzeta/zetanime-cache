import fetch from "node-fetch";

const API = "https://zetapi-api.samvelzeta.workers.dev";

async function safeFetch(url) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch {
    return null;
  }
}

async function run() {

  console.log("🚀 BOT PRO");

  const latest = await safeFetch(`${API}/api/list/latest-episodes`);

  for (const ep of latest?.data || []) {

    const slug = ep.slug.replace(/-\d+$/, "");
    const number = ep.number;

    console.log(`🔍 ${slug} - ${number}`);

    const res = await safeFetch(
      `${API}/api/anime/episode/${slug}/${number}?lang=sub`
    );

    if (res?.data?.servers?.length) {
      console.log("✔ guardado");
    } else {
      console.log("❌ sin servers");
    }
  }
}

run();
