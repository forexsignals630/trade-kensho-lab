import { Info } from "lucide-react";

interface Props {
  className?: string;
}

export default function AdDisclosure({ className = "" }: Props) {
  return (
    <div className={`flex gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700 ${className}`}>
      <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <p>
        <span className="font-semibold text-amber-800">広告開示</span>
        　この記事には広告・アフィリエイトリンクを含む場合があります。ただし、掲載内容は記録・計算・検証支援を目的としており、特定の売買判断や利益を保証するものではありません。
        <a href="/editorial-policy" className="text-brand-600 hover:underline ml-1">編集方針</a>
      </p>
    </div>
  );
}
