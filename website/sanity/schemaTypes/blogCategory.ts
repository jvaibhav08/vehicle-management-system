import { defineField, defineType } from "sanity";
export const blogCategoryType = defineType({ name: "blogCategory", title: "Blog Category", type: "document", fields: [
  defineField({ name: "title", title: "Title", type: "string" }),
  defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" } }),
  defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
] });
