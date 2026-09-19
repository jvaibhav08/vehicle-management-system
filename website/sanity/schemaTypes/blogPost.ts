import { defineField, defineType } from "sanity";
export const blogPostType = defineType({ name: "blogPost", title: "Blog Post", type: "document", fields: [
  defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
  defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
  defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3 }),
  defineField({ name: "featuredImage", title: "Featured image", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })] }),
  defineField({ name: "publishedAt", title: "Published at", type: "datetime" }),
  defineField({ name: "author", title: "Author", type: "reference", to: [{ type: "author" }] }),
  defineField({ name: "categories", title: "Categories", type: "array", of: [{ type: "reference", to: [{ type: "blogCategory" }] }] }),
  defineField({ name: "body", title: "Article body", type: "array", of: [{ type: "block" }, { type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string", title: "Alternative text" })] }] }),
  defineField({ name: "seo", title: "SEO", type: "seo" }),
] });
