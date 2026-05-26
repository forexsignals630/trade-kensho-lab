import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import type { ArticleMeta } from "@/types/article";
import { formatDate } from "@/lib/utils";

interface Props {
  articles: ArticleMeta[];
  className?: string;
}

export default function RelatedArticles({ articles, className = "" }: Props) {
  if (articles.length === 0) return null;

  return (
    <aside className={className}>
      <h2 className="text-base font-bold text-slate-800 mb-3">関連記事</h2>
      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="flex gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group"
          >
            <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 text-base">
              📄
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
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
        ))}
      </div>
    </aside>
  );
}
