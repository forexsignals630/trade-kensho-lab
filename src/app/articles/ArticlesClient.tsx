"use client";

import { useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import type { ArticleMeta } from "@/types/article";

type FilterKey = "all" | "trade-journal" | "risk-management" | "lot-calc" | "analysis" | "tools";

interface FilterConfig {
  key: FilterKey;
  label: string;
  match: (a: ArticleMeta) => boolean;
}

const FILTERS: FilterConfig[] = [
  {
    key: "all",
    label: "すべて",
    match: () => true,
  },
  {
    key: "trade-journal",
    label: "トレード日誌",
    match: (a) => ["トレード記録", "テンプレート"].includes(a.category),
  },
  {
    key: "risk-management",
    label: "リスク管理",
    match: (a) => a.category === "リスク管理",
  },
  {
    key: "lot-calc",
    label: "ロット計算",
    match: (a) => Boolean(a.tags?.includes("ロット計算")),
  },
  {
    key: "analysis",
    label: "検証・分析",
    match: (a) => ["検証・バックテスト", "比較・レビュー"].includes(a.category),
  },
  {
    key: "tools",
    label: "ツール解説",
    match: (a) =>
      a.category === "TradingView" ||
      Boolean(a.tags?.some((t) => ["ツール", "ツール比較", "チャート"].includes(t))),
  },
];

interface Props {
  articles: ArticleMeta[];
}

export default function ArticlesClient({ articles }: Props) {
  const [activeKey, setActiveKey] = useState<FilterKey>("all");

  const activeFilter = FILTERS.find((f) => f.key === activeKey)!;
  const filtered = articles.filter(activeFilter.match);

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((filter) => {
          const count =
            filter.key === "all"
              ? articles.length
              : articles.filter(filter.match).length;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveKey(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeKey === filter.key
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filter.label}
              <span className="ml-1 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-4">📄</p>
          <p className="font-medium">このカテゴリの記事はまだありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filtered.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </>
  );
}
