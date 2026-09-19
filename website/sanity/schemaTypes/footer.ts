import { defineField, defineType } from "sanity";
export const footerType = defineType({ name: "footer", title: "Footer", type: "document", fields: [
  defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
  defineField({ name: "copyright", title: "Copyright text", type: "string" }),
  defineField({ name: "links", title: "Links", type: "array", of: [{ type: "object", fields: [defineField({ name: "label", type: "string" }), defineField({ name: "href", type: "string" })] }] }),
] });
