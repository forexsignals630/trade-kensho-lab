import { Calendar, Clock } from "lucide-react";

interface Props {
  author: string;
  description?: string;
  updatedAt?: string;
  readingTime?: number;
  className?: string;
}

export default function AuthorBox({ author, description, updatedAt, readingTime, className = "" }: Props) {
  return (
    <div className={`flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl ${className}`}>
      <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
        <span className="text-brand-700 font-bold text-base">T</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 mb-0.5">{author}</p>
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed mb-2">{description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          {updatedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              最終更新：{new Date(updatedAt).toLocaleDateString("ja-JP")}
            </span>
          )}
          {readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              約{readingTime}分で読める
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
