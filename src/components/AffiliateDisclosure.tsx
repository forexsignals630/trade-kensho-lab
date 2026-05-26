import { Info } from "lucide-react";
import Link from "next/link";

interface Props {
  className?: string;
}

/**
 * アフィリエイト・広告開示バナー
 * 記事本文やツールページの上部に設置します。
 */
export default function AffiliateDisclosure({ className = "" }: Props) {
  return (
    <div
      className={`flex gap-2.5 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700 ${className}`}
    >
      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" aria-hidden />
      <p className="leading-relaxed">
        <span className="font-semibold text-blue-800">広告開示</span>
        　この記事には広告・アフィリエイトリンクを含む場合があります。ただし、掲載内容は記録・計算・検証支援を目的としており、特定の売買判断や利益を保証するものではありません。
        <Link
          href="/advertising-policy"
          className="text-brand-600 hover:underline ml-1 whitespace-nowrap"
        >
          広告掲載方針
        </Link>
      </p>
    </div>
  );
}
