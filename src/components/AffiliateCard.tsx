"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { trackAffiliateClick } from "@/lib/analytics";
import type { AffiliateItem } from "@/data/affiliateItems";

interface Props {
  item: AffiliateItem;
}

/**
 * アフィリエイト・外部サービスカード
 *
 * - href が空文字列のカードは呼び出し側でフィルタ済みのため、ここでは href が必ず存在します。
 * - rel="sponsored noopener noreferrer" / target="_blank" を固定で付与します。
 * - PR ラベルを右上に表示します。
 * - image が指定されている場合はロゴ画像を表示し、ない場合は icon 絵文字にフォールバックします。
 */
export default function AffiliateCard({ item }: Props) {
  const handleClick = () => {
    trackAffiliateClick(item.title, item.href);
  };

  return (
    <div className="affiliate-card-float relative flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-brand-300 transition-colors">

      {/* ロゴ画像（image が指定されている場合） */}
      {item.image && (
        <div className="relative w-full h-32 bg-slate-50 border-b border-slate-100 shrink-0">
          <Image
            src={item.image}
            alt={`${item.title} ロゴ`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4"
          />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        {/* PR ラベル */}
        {item.isSponsored && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded leading-none tracking-wide">
            PR
          </span>
        )}

        {/* アイコン絵文字 + カテゴリ（image がない場合） */}
        <div className="flex items-center gap-2 mb-3">
          {!item.image && item.icon && (
            <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center text-xl shrink-0">
              {item.icon}
            </div>
          )}
          <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
            {item.category}
          </span>
        </div>

        {/* タイトル */}
        <h3 className="text-sm font-bold text-slate-900 mb-1.5 pr-6">{item.title}</h3>

        {/* 説明 */}
        <p className="text-xs text-slate-500 leading-relaxed mb-2 flex-1">{item.description}</p>

        {/* 用途 */}
        <p className="text-xs text-slate-400 mb-4">
          <span className="font-medium text-slate-500">用途：</span>
          {item.useCase}
        </p>

        {/* CTA */}
        <a
          href={item.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors"
        >
          {item.ctaLabel}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
