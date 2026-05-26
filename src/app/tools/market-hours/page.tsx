import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import RelatedTools from "@/components/RelatedTools";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "マーケット時間帯 - FX・CFD市場セッション時間（JST）",
  description:
    "東京・ロンドン・ニューヨーク市場のセッション時間を日本時間（JST）で確認。オーバーラップ時間帯や夏時間についても解説。",
  path: "/tools/market-hours",
});

const RELATED_TOOLS = [
  { title: "ロット計算ツール", description: "適切なロット数を計算", href: "/tools/lot-calculator", icon: "🧮" },
  { title: "スプレッドコスト計算", description: "取引コストを試算", href: "/tools/spread-cost-calculator", icon: "💰" },
];

const SESSIONS = [
  {
    name: "東京市場",
    flag: "🇯🇵",
    open: "09:00",
    close: "18:00",
    color: "brand",
    pairs: "USD/JPY, EUR/JPY, AUD/JPY",
    note: "アジア時間。流動性は低め。方向感が出にくい場合も。",
    bar: { start: 9, width: 9 },
  },
  {
    name: "ロンドン市場",
    flag: "🇬🇧",
    open: "16:00（冬17:00）",
    close: "01:00（冬02:00）",
    color: "green",
    pairs: "EUR/USD, GBP/USD, EUR/GBP",
    note: "欧州時間。最も流動性が高い。大きな動きが起こりやすい。",
    bar: { start: 16, width: 9 },
  },
  {
    name: "ニューヨーク市場",
    flag: "🇺🇸",
    open: "21:00（冬22:00）",
    close: "06:00（冬07:00）",
    color: "amber",
    pairs: "USD/JPY, EUR/USD, USD/CAD",
    note: "米国時間。ロンドンとのオーバーラップ帯が特に活発。",
    bar: { start: 21, width: 9 },
  },
];

const OVERLAPS = [
  {
    name: "東京 × ロンドン（夏時間）",
    time: "16:00〜18:00 JST",
    note: "2時間のオーバーラップ。EUR/JPY等で動きが出やすい。",
    color: "purple",
  },
  {
    name: "ロンドン × ニューヨーク（夏時間）",
    time: "21:00〜01:00 JST",
    note: "最もボラティリティが高い時間帯。重要指標発表も集中。",
    color: "red",
  },
];

export default function MarketHoursPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "無料ツール", href: "/tools" }, { label: "マーケット時間帯" }]} />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">FX・CFD マーケット時間帯（JST）</h1>
        <p className="text-slate-600 leading-relaxed">
          東京・ロンドン・ニューヨークの主要3市場のセッション時間を日本時間（JST）で確認できます。
        </p>
      </div>

      {/* Sessions */}
      <div className="space-y-4 mb-10">
        {SESSIONS.map((session) => (
          <div key={session.name} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{session.flag}</span>
                <div>
                  <h2 className="font-bold text-slate-800">{session.name}</h2>
                  <p className="text-sm text-slate-500">{session.note}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 text-lg">
                  {session.open} <span className="text-slate-400 font-normal text-sm">〜</span> {session.close}
                </p>
                <p className="text-xs text-slate-400">JST</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg px-4 py-2">
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-700">主要ペア: </span>
                {session.pairs}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Overlaps */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-slate-900 mb-4">オーバーラップ時間帯</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {OVERLAPS.map((overlap) => (
            <div key={overlap.name} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="font-semibold text-amber-800 text-sm mb-1">{overlap.name}</p>
              <p className="text-xl font-bold text-amber-700 mb-2">{overlap.time}</p>
              <p className="text-xs text-amber-700 leading-relaxed">{overlap.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline visual */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-slate-800 mb-5">24時間タイムライン（夏時間・JST）</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hours */}
            <div className="flex mb-2">
              {Array.from({ length: 25 }, (_, i) => (
                <div key={i} className="flex-1 text-center text-xs text-slate-400">
                  {i % 3 === 0 ? `${i}` : ""}
                </div>
              ))}
            </div>
            {/* Tokyo */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-24 text-xs font-medium text-slate-600 shrink-0">🇯🇵 東京</span>
              <div className="flex-1 h-7 bg-slate-100 rounded-full relative overflow-hidden">
                <div
                  className="absolute h-full bg-brand-400 rounded-full"
                  style={{ left: `${(9 / 24) * 100}%`, width: `${(9 / 24) * 100}%` }}
                />
              </div>
            </div>
            {/* London */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-24 text-xs font-medium text-slate-600 shrink-0">🇬🇧 ロンドン</span>
              <div className="flex-1 h-7 bg-slate-100 rounded-full relative overflow-hidden">
                <div
                  className="absolute h-full bg-green-400 rounded-full"
                  style={{ left: `${(16 / 24) * 100}%`, width: `${(9 / 24) * 100}%` }}
                />
              </div>
            </div>
            {/* NY */}
            <div className="flex items-center gap-2 mb-2">
              <span className="w-24 text-xs font-medium text-slate-600 shrink-0">🇺🇸 NY</span>
              <div className="flex-1 h-7 bg-slate-100 rounded-full relative overflow-hidden">
                <div
                  className="absolute h-full bg-amber-400 rounded-l-full"
                  style={{ left: `${(21 / 24) * 100}%`, width: `${(3 / 24) * 100}%` }}
                />
                <div
                  className="absolute h-full bg-amber-400 rounded-r-full"
                  style={{ left: 0, width: `${(6 / 24) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">※ 夏時間（3月〜10月頃）の目安です。冬時間はロンドン・NYが1時間ずつ後ろにシフトします。</p>
      </div>

      {/* DST Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <p className="text-sm font-semibold text-amber-800 mb-2">夏時間（サマータイム）について</p>
        <ul className="text-xs text-amber-700 space-y-1 leading-relaxed list-disc list-inside">
          <li>欧州（ロンドン）は3月最終日曜〜10月最終日曜が夏時間（UTC+1）</li>
          <li>米国（NY）は3月第2日曜〜11月第1日曜が夏時間（EDT = UTC-4）</li>
          <li>夏時間中は冬時間より1時間早く開始・終了します</li>
          <li>日本（JST = UTC+9）は夏時間制度がないため、変化しません</li>
        </ul>
      </div>

      <RelatedTools tools={RELATED_TOOLS} className="mb-8" />
      <DisclaimerBox />
    </div>
  );
}
