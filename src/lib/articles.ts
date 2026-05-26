import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Article, ArticleMeta } from "@/types/article";

const ARTICLES_DIR = path.join(process.cwd(), "src/content/articles");

function getArticleFiles(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
}

export function getAllArticles(includeUnpublished = false): ArticleMeta[] {
  const files = getArticleFiles();
  const articles = files.map((filename) => {
    const slug = filename.replace(/\.(mdx|md)$/, "");
    const filePath = path.join(ARTICLES_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    return { slug, ...data } as ArticleMeta;
  });

  return articles
    .filter((a) => includeUnpublished || !a.draft)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getArticleBySlug(slug: string): Article | null {
  const extensions = [".mdx", ".md"];
  for (const ext of extensions) {
    const filePath = path.join(ARTICLES_DIR, `${slug}${ext}`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      return { slug, content, ...data } as Article;
    }
  }
  return null;
}

export function getArticlesByCategory(category: string): ArticleMeta[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getRelatedArticles(slug: string, limit = 3): ArticleMeta[] {
  const current = getArticleBySlug(slug);
  if (!current) return [];
  return getAllArticles()
    .filter((a) => a.slug !== slug && (a.category === current.category || a.tags?.some((t) => current.tags?.includes(t))))
    .slice(0, limit);
}
