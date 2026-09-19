import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "vms-public-website",
  title: "VMS Public Website",
  projectId: process.env.SANITY_PROJECT_ID || "g9jd8pvn",
  dataset: process.env.SANITY_DATASET || "production",
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
