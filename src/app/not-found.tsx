import Link from "next/link";
import { ArrowLeft, Home, Calculator } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="max-w-md">
        <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-3">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">ページが見つかりません</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          お探しのページは移動・削除されたか、URLが間違っている可能性があります。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            トップページへ
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-brand-300 text-slate-700 font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <Calculator className="w-4 h-4" />
            ツール一覧
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-400 mb-3">よく使われるページ</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "ロット計算", href: "/tools/lot-calculator" },
              { label: "pips計算", href: "/tools/pips-calculator" },
              { label: "RR計算", href: "/tools/risk-reward-calculator" },
              { label: "期待値計算", href: "/tools/expectancy-calculator" },
              { label: "損益計算", href: "/tools/profit-loss-calculator" },
              { label: "記事一覧", href: "/articles" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-brand-600 hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
