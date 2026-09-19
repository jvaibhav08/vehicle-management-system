import { defineField, defineType } from "sanity";
export const pageType = defineType({ name: "page", title: "Page", type: "document", fields: [
  defineField({ name: "title", title: "Title", type: "string" }),
  defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title", maxLength: 96 } }),
  defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
  defineField({ name: "content", title: "Content", type: "array", of: [{ type: "block" }] }),
  defineField({ name: "seo", title: "SEO", type: "seo" }),
] });
