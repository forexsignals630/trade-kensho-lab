import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ArticleMeta } from "@/types/article";

interface Props {
  article: ArticleMeta;
  variant?: "default" | "horizontal";
}

const CATEGORY_COLORS: Record<string, string> = {
  "トレード記録": "bg-blue-100 text-blue-700",
  "リスク管理": "bg-green-100 text-green-700",
  "検証・バックテスト": "bg-purple-100 text-purple-700",
  "TradingView": "bg-orange-100 text-orange-700",
  "VPS運用": "bg-cyan-100 text-cyan-700",
  "比較・レビュー": "bg-pink-100 text-pink-700",
  "テンプレート": "bg-yellow-100 text-yellow-700",
  "初心者向け基礎": "bg-slate-100 text-slate-600",
};

export default function ArticleCard({ article, variant = "default" }: Props) {
  const colorClass = CATEGORY_COLORS[article.category] ?? "bg-slate-100 text-slate-600";

  if (variant === "horizontal") {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group"
      >
        <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-brand-600 text-lg">📄</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
              {article.category}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 line-clamp-2 transition-colors">
            {article.title}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(article.publishedAt)}
            </span>
            {article.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readingTime}分で読める
              </span>
            )}
          </div>
        </div>
        <span className="text-slate-300 group-hover:text-brand-400 transition-colors text-lg">›</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-brand-300 hover:shadow-md transition-all group"
    >
      <div className="h-36 relative overflow-hidden bg-gradient-to-br from-brand-50 to-slate-100">
        {article.ogImage ? (
          <Image
            src={article.ogImage}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-4xl opacity-60">📊</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
          {article.category}
        </span>
        <h3 className="mt-2 text-sm font-semibold text-slate-800 group-hover:text-brand-600 line-clamp-2 transition-colors leading-snug">
          {article.title}
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {article.description}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(article.publishedAt)}
          </span>
          {article.readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTime}分
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
