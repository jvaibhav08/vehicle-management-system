import { defineField, defineType } from "sanity";
export const navigationType = defineType({ name: "navigation", title: "Navigation", type: "document", fields: [
  defineField({ name: "title", title: "Internal title", type: "string", initialValue: "Primary navigation" }),
  defineField({ name: "items", title: "Links", type: "array", of: [{ type: "object", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "href", type: "string" })] }] }),
] });
