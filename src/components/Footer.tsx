import Link from "next/link";
import { Mail, ClipboardCheck } from "lucide-react";

const FOOTER_LINKS = {
  サイトメニュー: [
    { label: "無料ツール", href: "/tools" },
    { label: "記事一覧", href: "/articles" },
    { label: "カテゴリ一覧", href: "/categories" },
    { label: "編集方針", href: "/editorial-policy" },
  ],
  カテゴリ: [
    { label: "トレード日誌", href: "/categories/trade-journal" },
    { label: "リスク管理", href: "/categories/risk-management" },
    { label: "検証・分析", href: "/categories/analysis" },
    { label: "ツール解説", href: "/categories/tools" },
    { label: "すべての記事", href: "/articles" },
  ],
  サポート: [
    { label: "使い方ガイド", href: "/categories/tools" },
    { label: "お問い合わせ", href: "/contact" },
    { label: "運営者情報", href: "/about" },
    { label: "サイトマップ", href: "/sitemap.xml" },
  ],
  法的情報: [
    { label: "免責事項・利用規約", href: "/disclaimer" },
    { label: "プライバシーポリシー", href: "/privacy-policy" },
    { label: "広告掲載方針", href: "/advertising-policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center mb-3" style={{ gap: "11px" }}>
              <div className="w-7 h-7 bg-brand-600 flex items-center justify-center" style={{ borderRadius: "8px" }}>
                <ClipboardCheck className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white" style={{ fontSize: "15px", fontWeight: 700 }}>トレード検証ラボ</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              個人トレーダーの記録・検証・改善をサポートするメディアです。実際に役立つ情報・ツールを提供します。
            </p>
            <div className="flex items-center gap-3">
              <a href="/contact" aria-label="お問い合わせ" className="text-slate-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 space-y-3">
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            本サイトは記録・計算・検証支援を目的とした情報を提供しており、売買判断・投資助言・利益保証を目的としたものではありません。
          </p>
          <p className="text-xs text-slate-500 text-center">
            © 2026 トレード検証ラボ All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
