import { defineField, defineType } from "sanity";

export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "metaTitle", title: "Meta title", type: "string", validation: (Rule) => Rule.max(60) }),
    defineField({ name: "metaDescription", title: "Meta description", type: "text", rows: 3, validation: (Rule) => Rule.max(160) }),
    defineField({ name: "ogImage", title: "Open Graph image", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })] }),
    defineField({ name: "noIndex", title: "Hide from search engines", type: "boolean", initialValue: false }),
  ],
});
