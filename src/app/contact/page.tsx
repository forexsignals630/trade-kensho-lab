import Link from "next/link";
import { AlertCircle } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { buildMetadata, SITE_URL } from "@/lib/metadata";
import ContactForm from "./ContactForm";

export const metadata = buildMetadata({
  title: "お問い合わせ",
  description:
    "トレード検証ラボへのお問い合わせページです。記事内容、ツール、不具合、広告掲載などに関するご連絡はこちらからお願いします。",
  path: "/contact",
});

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "お問い合わせ",
  description: "トレード検証ラボへのお問い合わせページです。",
  url: `${SITE_URL}/contact`,
  isPartOf: { "@type": "WebSite", name: "トレード検証ラボ", url: SITE_URL },
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }} />
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <Breadcrumbs items={[{ label: "お問い合わせ" }]} />

      {/* Header */}
      <div className="mt-6 mb-7">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">お問い合わせ</h1>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          トレード検証ラボへのお問い合わせは、以下のフォームよりお願いいたします。
          記事内容、ツールの不具合、広告掲載、その他ご連絡事項がある場合はこちらからご連絡ください。
        </p>
      </div>

      {/* Form */}
      <ContactForm />

      {/* Notes card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-5">
        <div className="flex items-center gap-3 bg-slate-50 border-b border-slate-100 px-5 py-3.5">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <h2 className="text-sm font-bold text-slate-700">ご確認ください</h2>
        </div>
        <ul className="px-5 py-4 space-y-2">
          {[
            "お問い合わせ内容によっては、返信までお時間をいただく場合があります。",
            "個別の売買判断や投資助言に関するご相談には回答できません。",
            "スパム・広告目的のお問い合わせには対応しません。",
            "ツールの計算結果に関するご質問は、まず免責事項をご確認ください。",
          ].map((note) => (
            <li key={note} className="flex items-start gap-2 text-xs text-slate-500">
              <span className="text-slate-300 mt-0.5 shrink-0">•</span>
              {note}
            </li>
          ))}
        </ul>
      </div>

      {/* Related links */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">関連ページ</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "免責事項", href: "/disclaimer" },
            { label: "プライバシーポリシー", href: "/privacy-policy" },
            { label: "運営者情報", href: "/about" },
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
