import { defineField, defineType } from "sanity";
export const homePageType = defineType({ name: "homePage", title: "Home Page", type: "document", fields: [
  defineField({ name: "heroEyebrow", title: "Hero eyebrow", type: "string" }),
  defineField({ name: "heroTitle", title: "Hero title", type: "string" }),
  defineField({ name: "heroText", title: "Hero text", type: "text", rows: 3 }),
  defineField({ name: "heroCtaLabel", title: "CTA label", type: "string" }),
  defineField({ name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })] }),
  defineField({ name: "features", title: "Feature cards", type: "array", of: [{ type: "object", fields: [defineField({ name: "title", type: "string" }), defineField({ name: "description", type: "text", rows: 2 }), defineField({ name: "icon", type: "string", options: { list: ["car", "shield", "file", "chart"] } })] }] }),
  defineField({ name: "seo", title: "SEO", type: "seo" }),
] });
