import { defineField, defineType } from "sanity";
export const authorType = defineType({ name: "author", title: "Author", type: "document", fields: [
  defineField({ name: "name", title: "Name", type: "string" }),
  defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
  defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })] }),
  defineField({ name: "bio", title: "Bio", type: "text", rows: 3 }),
] });
