import { buildMetadata, SITE_URL } from "@/lib/metadata";
import { getAllArticles } from "@/lib/articles";
import LotCalculatorClient from "./LotCalculatorClient";

export const metadata = buildMetadata({
  title: "ロット計算ツール",
  description:
    "口座資金、許容リスク、損切り幅からロット数を計算できます。FX通貨ペア、XAUUSD、BTCUSD、株価指数CFDにも対応した記録・計算支援ツールです。",
  path: "/tools/lot-calculator",
});

// ─── WebApplication JSON-LD ──────────────────────────────────────────────────

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ロット計算ツール",
  description:
    "口座資金・許容リスク率・損切り幅から適正ロット数を計算する無料ツール。FX通貨ペアおよびCFD銘柄（XAUUSD・BTCUSD・JP225・US100・US500）に対応。",
  url: `${SITE_URL}/tools/lot-calculator`,
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

const RELATED_SLUGS = ["how-to-use-lot-calculator", "stop-loss-width-basics"];

export default function LotCalculatorPage() {
  const articles = getAllArticles().filter((a) => RELATED_SLUGS.includes(a.slug));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <LotCalculatorClient relatedArticles={articles} />
    </>
  );
}
