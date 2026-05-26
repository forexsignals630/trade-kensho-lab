import { buildMetadata, SITE_URL } from "@/lib/metadata";
import { getAllArticles } from "@/lib/articles";
import PipsCalculatorClient from "./PipsCalculatorClient";

export const metadata = buildMetadata({
  title: "pips計算ツール",
  description:
    "エントリー価格と決済価格からpipsまたはpointsを計算できる無料ツールです。FX通貨ペア、XAUUSD、BTCUSD、株価指数CFDの値幅確認に活用できます。",
  path: "/tools/pips-calculator",
});

// ─── WebApplication JSON-LD ──────────────────────────────────────────────────

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "pips計算ツール",
  description:
    "エントリー価格と決済価格・SL価格・TP価格の差からpipsまたはpointsを計算する無料ツール。FX通貨ペアおよびCFD銘柄（XAUUSD・BTCUSD・JP225・US100・US500）に対応。",
  url: `${SITE_URL}/tools/pips-calculator`,
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
  "how-to-use-pips-calculator",
  "stop-loss-width-basics",
];

export default function PipsCalculatorPage() {
  const articles = getAllArticles().filter((a) => RELATED_SLUGS.includes(a.slug));
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <PipsCalculatorClient relatedArticles={articles} />
    </>
  );
}
