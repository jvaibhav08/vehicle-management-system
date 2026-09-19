import "server-only";
import { sanityClient } from "./client";
import { dataset, projectId } from "@/sanity/env";

const options = { next: { revalidate: 60 } };
const postFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  featuredImage,
  publishedAt,
  "author": author->{name, "slug": slug.current, image, bio},
  "categories": categories[]->{title, "slug": slug.current, description},
  "categoryIds": categories[]._ref,
  seo
`;
const isSanityConfigured = Boolean(projectId && dataset);

function formatSanityError(error: unknown) {
  if (!(error instanceof Error)) return String(error);

  const apiError = error as Error & {
    statusCode?: number;
    response?: { statusCode?: number; status?: number; body?: unknown };
    details?: { description?: string };
  };
  const status = apiError.statusCode || apiError.response?.statusCode || apiError.response?.status;
  const body = apiError.response?.body;
  const apiMessage = typeof body === "object" && body && "message" in body
    ? String((body as { message?: unknown }).message)
    : apiError.details?.description;

  return [status ? `HTTP ${status}` : undefined, error.message, apiMessage]
    .filter(Boolean)
    .join(" — ");
}

async function fetchSanity<T>(query: string, params: Record<string, unknown> = {}, fallback: T): Promise<T> {
  if (!isSanityConfigured) return fallback;

  try {
    return await sanityClient.fetch<T>(query, params, options);
  } catch (error) {
    // Do not log configuration or the token. The query is safe to log and
    // makes it clear which server-side content read failed.
    console.error(`Sanity read failed: ${formatSanityError(error)}`, { query });
    return fallback;
  }
}

export async function getSiteSettings() {
  return fetchSanity<any>(`*[_type == "siteSettings" && _id == "siteSettings"][0]{title, description, logo, vmsUrl, seo}`, {}, null);
}
export async function getNavigation() {
  return fetchSanity<any>(`*[_type == "navigation" && _id == "navigation"][0]{title, items[]{label, href}}`, {}, null);
}
export async function getFooter() {
  return fetchSanity<any>(`*[_type == "footer" && _id == "footer"][0]{description, copyright, links[]{label, href}}`, {}, null);
}
export async function getHomePage() {
  return fetchSanity<any>(`*[_type == "homePage" && _id == "homePage"][0]{heroEyebrow, heroTitle, heroText, heroCtaLabel, heroImage, features, seo}`, {}, null);
}
export async function getPosts(limit?: number) {
  return fetchSanity<any[]>(`*[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc)${limit ? `[0...${limit}]` : ""}{${postFields}}`, {}, []);
}

export async function getPostsPage(page: number, pageSize: number) {
  const start = Math.max(0, (page - 1) * pageSize);
  const end = start + pageSize;
  return fetchSanity<{ total: number; posts: any[] }>(
    `{
      "total": count(*[_type == "blogPost" && defined(slug.current)]),
      "posts": *[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc)[${start}...${end}]{${postFields}}
    }`,
    {},
    { total: 0, posts: [] },
  );
}

export async function getPost(slug: string) {
  const post = await fetchSanity<any>(`*[_type == "blogPost" && slug.current == $slug][0]{${postFields}, body}`, { slug }, null);
  if (!post) return null;

  const [previousPost, nextPost, relatedPosts] = await Promise.all([
    fetchSanity<any>(`*[_type == "blogPost" && defined(slug.current) && publishedAt < $publishedAt] | order(publishedAt desc)[0]{${postFields}}`, { publishedAt: post.publishedAt }, null),
    fetchSanity<any>(`*[_type == "blogPost" && defined(slug.current) && publishedAt > $publishedAt] | order(publishedAt asc)[0]{${postFields}}`, { publishedAt: post.publishedAt }, null),
    post.categoryIds?.length
      ? fetchSanity<any[]>(`*[_type == "blogPost" && defined(slug.current) && _id != $id && count(categories[@._ref in $categoryIds]) > 0] | order(publishedAt desc)[0...3]{${postFields}}`, { id: post._id, categoryIds: post.categoryIds }, [])
      : Promise.resolve([]),
  ]);

  return { ...post, previousPost, nextPost, relatedPosts };
}
export async function getPage(slug: string) {
  return fetchSanity<any>(`*[_type == "page" && slug.current == $slug][0]{title, intro, content, seo}`, { slug }, null);
}

export async function getCategories() {
  return fetchSanity<any[]>(`*[_type == "blogCategory" && defined(slug.current)] | order(title asc){title, "slug": slug.current, description}`, {}, []);
}

export async function getAuthors() {
  return fetchSanity<any[]>(`*[_type == "author" && defined(slug.current)] | order(name asc){name, "slug": slug.current, image, bio}`, {}, []);
}
