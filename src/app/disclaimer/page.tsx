import Link from "next/link";
import { ShieldCheck, Calculator, AlertTriangle, Globe, RefreshCw, FileText } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildMetadata, SITE_URL } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "免責事項",
  description:
    "トレード検証ラボの免責事項ページです。本サイトの情報、無料ツール、広告・アフィリエイト、投資判断に関する注意事項を掲載しています。",
  path: "/disclaimer",
});

// ─── Section component ─────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
  variant = "default",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "alert";
}) {
  if (variant === "alert") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-blue-100">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 text-blue-600">
            {icon}
          </div>
          <h2 className="text-base font-bold text-blue-900">{title}</h2>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm text-blue-800 leading-relaxed">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-5">
      <div className="flex items-center gap-3 bg-slate-50 border-b border-slate-100 px-6 py-4">
        <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 text-brand-600">
          {icon}
        </div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-3 text-sm text-slate-600 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "免責事項",
  description: "本サイトの情報、無料ツール、広告・アフィリエイト、投資判断に関する注意事項。",
  url: `${SITE_URL}/disclaimer`,
  isPartOf: { "@type": "WebSite", name: "トレード検証ラボ", url: SITE_URL },
};

export default function DisclaimerPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Breadcrumbs items={[{ label: "免責事項" }]} />

      {/* Header */}
      <div className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">免責事項</h1>
        <p className="text-xs text-slate-400">最終更新：2026年5月</p>
      </div>

      {/* 1. 投資判断 — 最重要 */}
      <Section icon={<ShieldCheck className="w-4 h-4" />} title="投資判断について" variant="alert">
        <p className="font-semibold text-blue-900">
          本サイトは、売買判断・投資助言・利益保証を目的としたものではありません。
        </p>
        <p>
          本サイトは、特定の金融商品の売買を推奨するものではありません。
          また、投資助言、投資顧問、利益保証を目的としたものでもありません。
        </p>
        <p>
          実際の取引判断は、ご自身の責任で行ってください。
          取引によって発生した損失や損害について、本サイトは責任を負いません。
        </p>
      </Section>

      {/* 2. 本サイトの情報 */}
      <Section icon={<FileText className="w-4 h-4" />} title="本サイトの情報について">
        <p>
          本サイトに掲載している情報は、トレード記録・計算・検証支援を目的とした一般的な情報です。
          正確性には配慮していますが、内容の完全性・正確性・最新性を保証するものではありません。
        </p>
      </Section>

      {/* 3. 計算ツール */}
      <Section icon={<Calculator className="w-4 h-4" />} title="計算ツールについて">
        <p>
          本サイトで提供しているロット計算ツール、リスクリワード計算ツール、期待値計算ツールなどは、
          記録・計算支援を目的とした参考ツールです。
        </p>
        <p>
          計算結果は、入力値や前提条件に基づく参考値です。
          実際の取引条件、ロット仕様、最小取引数量、スプレッド、手数料、スワップ、証拠金条件などは、
          ブローカーや口座タイプによって異なる場合があります。
        </p>
      </Section>

      {/* 4. CFD銘柄 */}
      <Section icon={<AlertTriangle className="w-4 h-4" />} title="CFD銘柄について">
        <p>
          XAUUSD、BTCUSD、JP225、US100、US500などのCFD銘柄は、ブローカーによって
          1lotあたりの価値、最小変動単位、損益計算方法が異なる場合があります。
        </p>
        <p>
          本サイトの計算結果を利用する場合は、ご利用の取引環境に合わせて必ず確認してください。
        </p>
      </Section>

      {/* 5. 広告・アフィリエイト */}
      <Section icon={<FileText className="w-4 h-4" />} title="広告・アフィリエイトについて">
        <p>
          本サイトでは、広告・アフィリエイトリンクを掲載する場合があります。
          リンク先の商品・サービスの申込みや購入に関する判断は、ユーザーご自身の責任で行ってください。
        </p>
      </Section>

      {/* 6. 外部リンク */}
      <Section icon={<Globe className="w-4 h-4" />} title="外部リンクについて">
        <p>
          本サイトから外部サイトへリンクする場合があります。
          外部サイトの内容、サービス、個人情報の取り扱いについて、本サイトは責任を負いません。
        </p>
      </Section>

      {/* 7. 変更について */}
      <Section icon={<RefreshCw className="w-4 h-4" />} title="免責事項の変更について">
        <p>
          本免責事項は、必要に応じて予告なく変更する場合があります。
          変更後の内容は、本ページに掲載された時点で有効となります。
        </p>
      </Section>

      {/* Related links */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mt-2">
        <p className="text-sm text-slate-500">関連ページ</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "プライバシーポリシー", href: "/privacy-policy" },
            { label: "運営者情報", href: "/about" },
            { label: "お問い合わせ", href: "/contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </div>

    </div>
    </>
  );
}
