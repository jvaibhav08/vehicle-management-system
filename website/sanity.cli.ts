import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_PROJECT_ID || "g9jd8vpn",
    dataset: process.env.SANITY_DATASET || "production",
  },
});
