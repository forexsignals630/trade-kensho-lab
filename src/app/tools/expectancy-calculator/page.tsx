import { buildMetadata, SITE_URL } from "@/lib/metadata";
import { getAllArticles } from "@/lib/articles";
import ExpectancyCalculatorClient from "./ExpectancyCalculatorClient";

export const metadata = buildMetadata({
  title: "期待値計算ツール",
  description:
    "勝率、平均利益、平均損失から、1回の取引あたりの期待値を計算できる無料ツールです。トレードルールの検証や記録の見直しに活用できます。",
  path: "/tools/expectancy-calculator",
});

// ─── WebApplication JSON-LD ──────────────────────────────────────────────────

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "期待値計算ツール",
  description:
    "勝率・平均利益・平均損失から1回あたりの期待値を計算する無料ツール。金額・R倍数・pipsの3つの入力モードに対応。",
  url: `${SITE_URL}/tools/expectancy-calculator`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web Browser",
  inLanguage: "ja",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  publisher: {
    "@type": "Organization",
    name: "トレード検証ラボ",
    url: SITE_URL,
  },
};

const RELATED_SLUGS = [
  "how-to-use-expected-value-calculator",
  "trade-review-weekend",
];

export default function ExpectancyCalculatorPage() {
  const articles = getAllArticles().filter((a) => RELATED_SLUGS.includes(a.slug));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <ExpectancyCalculatorClient relatedArticles={articles} />
    </>
  );
}
