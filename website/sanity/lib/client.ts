import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const token = process.env.SANITY_API_READ_TOKEN;

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !token,
  token,
  // Avoid blocking a page build indefinitely when the CMS is temporarily down.
  timeout: 5000,
  maxRetries: 0,
  // Public pages must only show published content. The token permits reads
  // from private datasets; it does not opt visitors into draft content.
  perspective: "published",
});
