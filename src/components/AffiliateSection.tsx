import AffiliateCard from "@/components/AffiliateCard";
import AFFILIATE_ITEMS from "@/data/affiliateItems";

interface Props {
  /** 表示するアフィリエイト ID の配列（順序通りに表示） */
  itemIds: string[];
  /** セクション見出し */
  heading?: string;
  /** セクション説明文 */
  description?: string;
  /** 追加の className */
  className?: string;
}

/**
 * アフィリエイト枠セクション
 *
 * - href が空のアイテムは自動的に除外します。
 * - 表示できるカードが 1 件もない場合はセクション全体を非表示にします。
 * - PR 開示テキストをフッターに表示します。
 */
export default function AffiliateSection({
  itemIds,
  heading = "関連サービス・参考ツール",
  description = "トレード記録や検証作業を効率化したい場合に参考になる外部サービスです。掲載内容は記録・分析環境の整理を目的としており、売買判断を推奨するものではありません。",
  className = "",
}: Props) {
  // href が設定されているアイテムのみ抽出（指定順を維持）
  const items = itemIds
    .map((id) => AFFILIATE_ITEMS.find((item) => item.id === id))
    .filter(
      (item): item is NonNullable<typeof item> =>
        item !== undefined && item.href !== ""
    );

  // 表示できるカードがなければ非表示
  if (items.length === 0) return null;

  return (
    <section className={`mt-12 pt-8 border-t border-slate-200 ${className}`}>
      {/* 見出し */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 mb-1">{heading}</h2>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>

      {/* カード一覧（枚数に応じて列数を調整） */}
      <div
        className={[
          "grid grid-cols-1 gap-4",
          items.length === 2 ? "sm:grid-cols-2" : "",
          items.length === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "",
          items.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {items.map((item) => (
          <AffiliateCard key={item.id} item={item} />
        ))}
      </div>

      {/* 広告開示フッター */}
      <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">
        PR・広告リンクを含む場合があります。掲載している外部サービスは、記録・分析環境の整備を目的として紹介するものであり、特定の売買判断・投資助言・利益保証を目的としたものではありません。
      </p>
    </section>
  );
}
