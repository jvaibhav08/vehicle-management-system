/**
 * Runtime configuration for server-side Sanity reads. Project IDs and dataset
 * names are not secrets, but keeping these values out of NEXT_PUBLIC_* means
 * content access remains an explicitly server-side concern.
 */
export const projectId = process.env.SANITY_PROJECT_ID || "g9jd8vpn";
export const dataset = process.env.SANITY_DATASET || "production";
export const apiVersion = process.env.SANITY_API_VERSION || "2026-09-12";
