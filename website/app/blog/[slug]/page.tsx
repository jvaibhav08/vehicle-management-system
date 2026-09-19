import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, Clock3, UserRound } from "lucide-react";
import { PostCards, RichContent, formatPostDate, readingTime } from "@/components/Content";
import { urlFor } from "@/sanity/lib/image";
import { getPost } from "@/sanity/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt;
  const image = post.seo?.ogImage || post.featuredImage;
  const ogImage = image ? urlFor(image).width(1200).height(630).fit("crop").url() : undefined;
  return { title, description, alternates: { canonical: `/blog/${post.slug}` }, robots: post.seo?.noIndex ? { index: false, follow: false } : undefined, openGraph: { type: "article", title, description, publishedTime: post.publishedAt, authors: post.author?.name ? [post.author.name] : undefined, images: ogImage ? [{ url: ogImage, alt: image?.alt || post.title, width: 1200, height: 630 }] : undefined }, twitter: { card: "summary_large_image", title, description, images: ogImage ? [ogImage] : undefined } };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const image = post.featuredImage ? urlFor(post.featuredImage).width(1600).height(900).fit("crop").url() : null;
  const date = formatPostDate(post.publishedAt);
  const minutes = readingTime(post.body);
  return <main className="blog-post-page"><div className="shell"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><ChevronRight size={14}/><Link href="/blog">Blog</Link><ChevronRight size={14}/><span aria-current="page">{post.title}</span></nav></div><article className="blog-article"><header className="article-header"><div className="article-categories">{post.categories?.length ? post.categories.map((category: any) => <span className="tag" key={category.slug || category.title}>{category.title}</span>) : <span className="tag">Fleet insights</span>}</div><h1>{post.title}</h1>{post.excerpt && <p className="article-dek">{post.excerpt}</p>}<div className="article-meta">{date && <span><CalendarDays size={16}/>{date}</span>}{post.author?.name && <span><UserRound size={16}/>By {post.author.name}</span>}<span><Clock3 size={16}/>{minutes} min read</span></div></header>{image && <figure className="article-hero"><Image src={image} alt={post.featuredImage?.alt || post.title} width={1600} height={900} priority sizes="(max-width: 900px) 100vw, 1100px"/>{post.featuredImage?.alt && <figcaption>{post.featuredImage.alt}</figcaption>}</figure>}<div className="article-reading"><RichContent value={post.body}/></div><div className="article-back"><Link href="/blog"><ArrowLeft size={16}/>Back to all articles</Link></div>{(post.previousPost || post.nextPost) && <nav className="article-pagination" aria-label="Adjacent articles">{post.previousPost ? <Link href={`/blog/${post.previousPost.slug}`}><span>Previous article</span><strong>{post.previousPost.title}</strong><ArrowLeft size={17}/></Link> : <span/>}{post.nextPost ? <Link href={`/blog/${post.nextPost.slug}`} className="next"><span>Next article</span><strong>{post.nextPost.title}</strong><ArrowRight size={17}/></Link> : <span/>}</nav>}</article>{post.relatedPosts?.length > 0 && <section className="section related-posts"><div className="shell"><div className="section-heading"><span className="eyebrow">Continue reading</span><h2>Related fleet insights</h2></div><PostCards posts={post.relatedPosts}/></div></section>}</main>;
}
