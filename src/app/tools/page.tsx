import { buildMetadata, SITE_URL } from "@/lib/metadata";
import ToolsClient from "./ToolsClient";

export const metadata = buildMetadata({
  title: "無料トレード検証ツール一覧",
  description:
    "ロット計算・pips計算・リスクリワード・期待値・損益計算・トレード日誌作成など、個人トレーダーの記録・計算・検証を支援する6種類の無料ツールを提供。登録不要、ブラウザで即利用可能。",
  path: "/tools",
});

// ─── ItemList JSON-LD ─────────────────────────────────────────────────────────

const TOOLS_FOR_LD = [
  { name: "ロット計算ツール", href: "/tools/lot-calculator" },
  { name: "pips計算ツール", href: "/tools/pips-calculator" },
  { name: "リスクリワード計算ツール", href: "/tools/risk-reward-calculator" },
  { name: "期待値計算ツール", href: "/tools/expectancy-calculator" },
  { name: "損益計算ツール", href: "/tools/profit-loss-calculator" },
  { name: "トレード日誌作成ツール", href: "/tools/trade-journal-template" },
];

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "無料トレード検証ツール一覧",
  description:
    "個人トレーダーの記録・計算・検証を支援する無料ツール一覧",
  url: `${SITE_URL}/tools`,
  numberOfItems: TOOLS_FOR_LD.length,
  itemListElement: TOOLS_FOR_LD.map((tool, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: tool.name,
    url: `${SITE_URL}${tool.href}`,
  })),
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ToolsClient />
    </>
  );
}
