import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

const client = createClient({
  projectId: "g9jd8pvn",
  dataset: "production",
  apiVersion: env.SANITY_API_VERSION || "2026-09-12",
  token: env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN,
  useCdn: false,
  perspective: "raw",
});

const expectedIds = ["siteSettings", "navigation", "footer", "homePage", "page-privacy-policy", "page-terms"];
const documents = await client.fetch(
  `*[_id in $ids]{_id, _type, _createdAt, _updatedAt} | order(_id asc)`,
  { ids: expectedIds },
);
const drafts = await client.fetch(`count(*[_id in $draftIds])`, {
  draftIds: expectedIds.map((id) => `drafts.${id}`),
});

console.log(JSON.stringify({ documents, draftCount: drafts }, null, 2));
