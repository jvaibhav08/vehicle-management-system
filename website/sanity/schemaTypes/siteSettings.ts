import { defineField, defineType } from "sanity";
export const siteSettingsType = defineType({ name: "siteSettings", title: "Site Settings", type: "document", fields: [
  defineField({ name: "title", title: "Site name", type: "string", initialValue: "Vehicle Management System" }),
  defineField({ name: "description", title: "Default description", type: "text", rows: 3 }),
  defineField({ name: "logo", title: "Logo", type: "image" }),
  defineField({ name: "vmsUrl", title: "VMS login URL", type: "url" }),
  defineField({ name: "seo", title: "Default SEO", type: "seo" }),
] });
