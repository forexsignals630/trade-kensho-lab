import Link from "next/link";
import { User, Cookie, BarChart2, Megaphone, Link2, RefreshCw, ShieldCheck } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildMetadata, SITE_URL } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "プライバシーポリシー",
  description:
    "トレード検証ラボのプライバシーポリシーです。個人情報、Cookie、アクセス解析、広告配信、アフィリエイトに関する方針を掲載しています。",
  path: "/privacy-policy",
});

// ─── Section component ─────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
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
  name: "プライバシーポリシー",
  description: "個人情報、Cookie、アクセス解析、広告配信、アフィリエイトに関する方針。",
  url: `${SITE_URL}/privacy-policy`,
  isPartOf: { "@type": "WebSite", name: "トレード検証ラボ", url: SITE_URL },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Breadcrumbs items={[{ label: "プライバシーポリシー" }]} />

      {/* Header */}
      <div className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">プライバシーポリシー</h1>
        <p className="text-xs text-slate-400">最終更新：2026年5月</p>
      </div>

      {/* 1. 個人情報の利用目的 */}
      <Section icon={<User className="w-4 h-4" />} title="個人情報の利用目的">
        <p>
          本サイトでは、お問い合わせ時に、名前やメールアドレスなどの個人情報をご入力いただく場合があります。
          取得した個人情報は、お問い合わせへの回答や必要な連絡のために利用します。
        </p>
      </Section>

      {/* 2. 第三者提供 */}
      <Section icon={<ShieldCheck className="w-4 h-4" />} title="個人情報の第三者提供">
        <p>
          取得した個人情報は、法令に基づく場合を除き、本人の同意なく第三者に提供することはありません。
        </p>
      </Section>

      {/* 3. Cookie */}
      <Section icon={<Cookie className="w-4 h-4" />} title="Cookieについて">
        <p>
          本サイトでは、利便性向上、アクセス解析、広告配信のためにCookieを使用する場合があります。
          Cookieにより、利用者のブラウザを識別することがありますが、個人を特定するものではありません。
        </p>
        <p>
          ブラウザの設定でCookieを無効にすることができますが、一部の機能が正常に動作しない場合があります。
        </p>
      </Section>

      {/* 4. アクセス解析 */}
      <Section icon={<BarChart2 className="w-4 h-4" />} title="アクセス解析について">
        <p>
          本サイトでは、アクセス解析ツールを利用する場合があります。
          アクセス解析ツールはCookieを使用してトラフィックデータを収集することがあります。
          収集されるデータには、ページビュー・滞在時間・流入元・デバイス情報等が含まれますが、
          個人を特定できる情報は含まれません。
        </p>
        <p className="text-xs text-slate-400">
          ※ 本サイトで使用するアクセス解析ツールについては、各ツールのプライバシーポリシーをご確認ください。
        </p>
      </Section>

      {/* 5. 広告配信 */}
      <Section icon={<Megaphone className="w-4 h-4" />} title="広告配信について">
        <p>
          本サイトでは、第三者配信の広告サービスを利用する場合があります。
          広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
        </p>
      </Section>

      {/* 6. アフィリエイト */}
      <Section icon={<Link2 className="w-4 h-4" />} title="アフィリエイトについて">
        <p>
          本サイトでは、アフィリエイトプログラムを利用する場合があります。
          掲載しているリンクを経由して商品やサービスの申込みがあった場合、
          運営者が報酬を受け取ることがあります。
        </p>
        <p>
          なお、掲載内容は記録・計算・検証支援を目的としており、
          特定の売買判断や利益を保証するものではありません。
        </p>
      </Section>

      {/* 7. 計算ツールのデータ */}
      <div className="bg-green-50 border border-green-200 rounded-2xl overflow-hidden mb-5">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-green-100">
          <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center shrink-0 text-green-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-green-900">計算ツールの入力データについて</h2>
        </div>
        <div className="px-6 py-5 text-sm text-green-800 leading-relaxed">
          <p>
            本サイトの計算ツールに入力されたデータはすべてブラウザ内で処理されます。
            外部サーバーへの送信・保存は行いません。
          </p>
        </div>
      </div>

      {/* 8. 免責事項リンク */}
      <Section icon={<ShieldCheck className="w-4 h-4" />} title="免責事項との関係">
        <p>
          本サイトの情報利用に関する注意事項については、
          <Link href="/disclaimer" className="text-brand-600 hover:text-brand-700 hover:underline">
            免責事項ページ
          </Link>
          もご確認ください。
        </p>
      </Section>

      {/* 9. 変更について */}
      <Section icon={<RefreshCw className="w-4 h-4" />} title="プライバシーポリシーの変更">
        <p>
          本ポリシーは、必要に応じて予告なく変更する場合があります。
          変更後の内容は、本ページに掲載された時点で有効となります。
        </p>
      </Section>

      {/* Related links */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mt-2">
        <p className="text-sm text-slate-500">関連ページ</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "免責事項", href: "/disclaimer" },
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
