import Link from "next/link";
import { ShieldCheck, BookOpen, Wrench, AlertTriangle, Megaphone } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildMetadata, SITE_URL } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "運営者情報",
  description:
    "トレード検証ラボの運営者情報ページです。トレード記録、リスク管理、検証プロセスを支援する無料ツールと実務記事を提供しています。",
  path: "/about",
});

// ─── Info table row ────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-0 py-3 border-b border-slate-100 last:border-0">
      <dt className="sm:w-44 shrink-0 text-xs font-semibold text-slate-500 sm:pt-0.5">{label}</dt>
      <dd className="text-sm text-slate-700 leading-relaxed">{children}</dd>
    </div>
  );
}

// ─── Section card ──────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
  variant = "default",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "warning" | "info";
}) {
  const headerCls =
    variant === "warning"
      ? "bg-amber-50 border-b border-amber-100 px-6 py-4"
      : variant === "info"
      ? "bg-blue-50 border-b border-blue-100 px-6 py-4"
      : "bg-slate-50 border-b border-slate-100 px-6 py-4";
  const iconBg =
    variant === "warning"
      ? "bg-amber-100 text-amber-600"
      : variant === "info"
      ? "bg-blue-100 text-blue-600"
      : "bg-brand-100 text-brand-600";
  const titleCls =
    variant === "warning"
      ? "text-amber-900"
      : variant === "info"
      ? "text-blue-900"
      : "text-slate-900";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
      <div className={headerCls}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <h2 className={`text-base font-bold ${titleCls}`}>{title}</h2>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "運営者情報",
  description: "トレード検証ラボの運営者情報ページです。",
  url: `${SITE_URL}/about`,
  isPartOf: { "@type": "WebSite", name: "トレード検証ラボ", url: SITE_URL },
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Breadcrumbs items={[{ label: "運営者情報" }]} />

      {/* Header */}
      <div className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">運営者情報</h1>
        <p className="text-slate-600 leading-relaxed text-[15px]">
          トレード検証ラボは、個人トレーダー向けに、トレード記録・リスク管理・検証プロセスを支援する
          無料ツールと実務記事を提供するWebメディアです。
        </p>
      </div>

      {/* 1. サイト概要 */}
      <SectionCard icon={<BookOpen className="w-4 h-4" />} title="トレード検証ラボについて">
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          トレード検証ラボは、トレード日誌、ロット計算、リスクリワード計算、期待値計算など、
          個人トレーダーが取引を記録・検証するための情報とツールを提供するメディアです。
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          本サイトは、特定の金融商品の売買を推奨するものではなく、
          記録・計算・検証支援を目的としています。
        </p>
      </SectionCard>

      {/* 2. 運営者情報テーブル */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">運営者情報</h2>
        </div>
        <div className="px-6 py-2">
          <dl>
            <InfoRow label="サイト名">トレード検証ラボ</InfoRow>
            <InfoRow label="運営者">トレード検証ラボ編集部</InfoRow>
            <InfoRow label="運営内容">トレード記録・計算・検証支援に関する情報提供</InfoRow>
            <InfoRow label="主なコンテンツ">
              無料計算ツール（ロット計算・pips計算・リスクリワード・期待値・損益計算・トレード日誌作成）、リスク管理、検証記事
            </InfoRow>
            <InfoRow label="お問い合わせ">
              <Link href="/contact" className="text-brand-600 hover:text-brand-700 hover:underline">
                お問い合わせページ
              </Link>
              からご連絡ください
            </InfoRow>
          </dl>
        </div>
      </div>

      {/* 3. 編集方針 */}
      <SectionCard icon={<Wrench className="w-4 h-4" />} title="編集方針">
        <p className="text-sm text-slate-600 leading-relaxed mb-3">
          本サイトでは、個人トレーダーが自身の取引を記録し、リスク管理や検証に活用できるよう、
          実務的で分かりやすい情報提供を心がけています。
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          記事やツールの内容は、可能な限り分かりやすく整理していますが、
          取引環境やブローカー仕様によって実際の計算結果や表示が異なる場合があります。
        </p>
      </SectionCard>

      {/* 4. 投資助言について */}
      <SectionCard
        icon={<ShieldCheck className="w-4 h-4" />}
        title="投資助言について"
        variant="info"
      >
        <p className="text-sm text-blue-800 leading-relaxed font-medium mb-2">
          本サイトは売買判断・投資助言を目的としたものではありません。
        </p>
        <p className="text-sm text-blue-700 leading-relaxed">
          本サイトのコンテンツは、売買判断・投資助言・利益保証を目的としたものではありません。
          実際の取引判断は、ご自身の責任で行ってください。
        </p>
      </SectionCard>

      {/* 5. 広告・アフィリエイトについて */}
      <SectionCard
        icon={<Megaphone className="w-4 h-4" />}
        title="広告・アフィリエイトについて"
        variant="warning"
      >
        <p className="text-sm text-amber-800 leading-relaxed mb-3">
          本サイトでは、広告・アフィリエイトリンクを掲載する場合があります。
          広告リンクから商品やサービスの申込みがあった場合、運営者が報酬を受け取ることがあります。
        </p>
        <p className="text-sm text-amber-700 leading-relaxed">
          ただし、掲載内容は記録・計算・検証支援を目的としており、
          特定の売買判断や利益を保証するものではありません。
        </p>
      </SectionCard>

      {/* Related links */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">詳しくは各ポリシーページをご確認ください</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "免責事項", href: "/disclaimer" },
            { label: "プライバシーポリシー", href: "/privacy-policy" },
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
