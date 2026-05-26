import { ShieldCheck } from "lucide-react";

interface Props {
  variant?: "default" | "tool" | "category";
  className?: string;
}

export default function DisclaimerBox({ variant = "default", className = "" }: Props) {
  if (variant === "tool") {
    return (
      <div className={`flex gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 ${className}`}>
        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">売買判断・投資助言ではありません</p>
          <p className="text-blue-700 text-xs leading-relaxed">
            本ツールは記録・計算支援を目的とするものであり、売買判断・投資助言・利益保証・相場予測を目的としたものではありません。
            実際の取引判断はご自身の責任で行ってください。
          </p>
        </div>
      </div>
    );
  }

  if (variant === "category") {
    return (
      <div className={`border-t border-slate-200 pt-6 mt-8 ${className}`}>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-600 mb-1">免責事項</p>
          <p>
            本ページは、トレード記録・計算・検証支援を目的とした一般的な情報です。
            特定の金融商品の売買を推奨するものではなく、投資助言・利益保証を目的としたものではありません。
            実際の取引判断はご自身の責任で行ってください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t border-slate-200 pt-6 mt-8 ${className}`}>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-500 leading-relaxed">
        <p className="font-semibold text-slate-600 mb-1">免責事項</p>
        <p>
          当サイトのコンテンツは、情報提供および学習・実務支援を目的としたものであり、売買判断・投資助言・利益保証を目的としたものではありません。
          特定の金融商品の売買を推奨するものではなく、実際の取引判断はご自身の責任のもとで行ってください。
          相場の変動により損失が生じる可能性があります。過去のパフォーマンスは将来の成果を保証するものではありません。
        </p>
      </div>
    </div>
  );
}
