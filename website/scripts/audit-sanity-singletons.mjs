import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = Object.fromEntries(readFileSync(resolve(process.cwd(), ".env.local"), "utf8").split(/\r?\n/).filter((line) => line && !line.startsWith("#")).map((line) => {
  const separator = line.indexOf("=");
  return [line.slice(0, separator), line.slice(separator + 1)];
}));
const client = createClient({ projectId: "g9jd8pvn", dataset: "production", apiVersion: env.SANITY_API_VERSION || "2026-09-12", token: env.SANITY_API_WRITE_TOKEN || env.SANITY_API_READ_TOKEN, useCdn: false, perspective: "published" });

console.log(JSON.stringify(await client.fetch(`*[_type in ["siteSettings", "navigation", "footer", "homePage"]] | order(_createdAt asc){_id, _type, _createdAt, "summary": select(_type == "siteSettings" => {title, description, vmsUrl}, _type == "navigation" => {title, "itemCount": count(items)}, _type == "footer" => {description, copyright, "linkCount": count(links)}, _type == "homePage" => {heroEyebrow, heroTitle, "featureCount": count(features)})}`), null, 2));
