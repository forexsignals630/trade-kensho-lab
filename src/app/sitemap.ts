import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";
import { SITE_URL } from "@/lib/metadata";

// ─── Static pages ─────────────────────────────────────────────────────────────

const STATIC_PAGES: {
  url: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastmod?: string;
}[] = [
  // ── Core ──────────────────────────────────────────────────────────────────
  { url: "/",        priority: 1.0, changeFrequency: "weekly" },
  // ── Tools ─────────────────────────────────────────────────────────────────
  { url: "/tools",                                  priority: 0.9, changeFrequency: "weekly" },
  { url: "/tools/lot-calculator",                   priority: 0.9, changeFrequency: "monthly" },
  { url: "/tools/risk-reward-calculator",           priority: 0.8, changeFrequency: "monthly" },
  { url: "/tools/expectancy-calculator",            priority: 0.8, changeFrequency: "monthly" },
  { url: "/tools/drawdown-recovery-calculator",     priority: 0.8, changeFrequency: "monthly" },
  { url: "/tools/pips-calculator",                   priority: 0.8, changeFrequency: "monthly" },
  { url: "/tools/spread-cost-calculator",           priority: 0.7, changeFrequency: "monthly" },
  { url: "/tools/market-hours",                     priority: 0.7, changeFrequency: "monthly" },
  { url: "/tools/trade-journal-template",           priority: 0.8, changeFrequency: "monthly" },
  { url: "/tools/profit-loss-calculator",           priority: 0.8, changeFrequency: "monthly" },
  { url: "/tools/backtest-sample-size-calculator",  priority: 0.7, changeFrequency: "monthly" },
  { url: "/tools/risk-of-ruin-simulator",           priority: 0.7, changeFrequency: "monthly" },
  // ── Articles ──────────────────────────────────────────────────────────────
  { url: "/articles",                                priority: 0.8, changeFrequency: "daily" },
  // ── Categories ────────────────────────────────────────────────────────────
  { url: "/categories",                              priority: 0.7, changeFrequency: "weekly" },
  { url: "/categories/trade-journal",               priority: 0.7, changeFrequency: "weekly" },
  { url: "/categories/risk-management",             priority: 0.7, changeFrequency: "weekly" },
  { url: "/categories/tools",                       priority: 0.7, changeFrequency: "weekly" },
  { url: "/categories/analysis",                    priority: 0.6, changeFrequency: "weekly" },
  // ── Trust pages ───────────────────────────────────────────────────────────
  { url: "/about",              priority: 0.5, changeFrequency: "yearly" },
  { url: "/editorial-policy",   priority: 0.4, changeFrequency: "yearly" },
  { url: "/advertising-policy", priority: 0.4, changeFrequency: "yearly" },
  { url: "/disclaimer",         priority: 0.5, changeFrequency: "yearly" },
  { url: "/privacy-policy",     priority: 0.5, changeFrequency: "yearly" },
  { url: "/contact",            priority: 0.5, changeFrequency: "yearly" },
];

// ─── Sitemap ──────────────────────────────────────────────────────────────────

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: page.lastmod ?? now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // Only include published (non-draft) articles
  const articles = getAllArticles();
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: new Date(article.updatedAt ?? article.publishedAt)
      .toISOString()
      .split("T")[0],
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...articleEntries];
}
