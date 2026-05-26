import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolInfo {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
}

interface Props {
  tool: ToolInfo;
  variant?: "default" | "compact" | "featured";
}

export default function ToolCard({ tool, variant = "default" }: Props) {
  if (variant === "compact") {
    return (
      <Link
        href={tool.href}
        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all group"
      >
        <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 text-lg">
          {tool.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors truncate">
            {tool.title}
          </p>
          <p className="text-xs text-slate-500 truncate">{tool.description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-400 transition-colors shrink-0" />
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={tool.href}
        className="block p-6 bg-white border border-slate-200 rounded-2xl hover:border-brand-300 hover:shadow-lg transition-all group"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
            {tool.icon}
          </div>
          <div className="flex-1">
            {tool.badge && (
              <span className="inline-block bg-brand-100 text-brand-700 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                {tool.badge}
              </span>
            )}
            <h3 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
              {tool.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{tool.description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
          詳しく見る <ArrowRight className="w-4 h-4" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={tool.href}
      className="block p-5 bg-white border border-slate-200 rounded-xl hover:border-brand-300 hover:shadow-md transition-all group"
    >
      <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-xl mb-3">
        {tool.icon}
      </div>
      {tool.badge && (
        <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full mb-2">
          {tool.badge}
        </span>
      )}
      <h3 className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors text-sm">
        {tool.title}
      </h3>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">
        {tool.description}
      </p>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-600">
        ツールを使う <ArrowRight className="w-3 h-3" />
      </div>
    </Link>
  );
}
