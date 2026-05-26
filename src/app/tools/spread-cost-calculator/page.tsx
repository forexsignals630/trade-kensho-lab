"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { calculateSpreadCost } from "@/lib/calculations/spreadCost";
import { trackToolCalculate } from "@/lib/analytics";

const RELATED_TOOLS = [
  { title: "ロット計算ツール", description: "適切なロット数を計算", href: "/tools/lot-calculator", icon: "🧮" },
  { title: "pips計算ツール", description: "エントリー・比較価格からpipsを計算", href: "/tools/pips-calculator", icon: "📐" },
];

export default function SpreadCostCalculatorPage() {
  const [spreadPips, setSpreadPips] = useState(0.3);
  const [lots, setLots] = useState(0.1);
  const [pipValue, setPipValue] = useState(1000);
  const [commissionPerSide, setCommissionPerSide] = useState(0);
  const [tradesPerMonth, setTradesPerMonth] = useState(20);

  const result = calculateSpreadCost({ spreadPips, lots, pipValue, commissionPerSide, tradesPerMonth });

  const handleCalculate = () => {
    trackToolCalculate("spread-cost-calculator", { spreadPips, lots, pipValue, commissionPerSide, tradesPerMonth });
  };

  return (
    <ToolLayout
      title="スプレッドコスト計算ツール"
      description="スプレッドと手数料から1回・月間・年間の取引コストを計算します。コストを把握することで戦略の収益性を正確に評価できます。"
      breadcrumbs={[
        { label: "無料ツール", href: "/tools" },
        { label: "スプレッドコスト計算" },
      ]}
      relatedTools={RELATED_TOOLS}
    >
      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-5">入力項目</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: "スプレッド（pips）", value: spreadPips, setter: setSpreadPips, step: 0.1, min: 0 },
            { label: "ロット数", value: lots, setter: setLots, step: 0.01, min: 0.001 },
            { label: "1ロット・1pips価値", value: pipValue, setter: setPipValue, step: 1, min: 0.01 },
            { label: "片道手数料", value: commissionPerSide, setter: setCommissionPerSide, step: 1, min: 0 },
            { label: "月間取引回数", value: tradesPerMonth, setter: setTradesPerMonth, step: 1, min: 1 },
          ].map(({ label, value, setter, step, min }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                onBlur={handleCalculate}
                step={step}
                min={min}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-5">計算結果</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "スプレッドコスト（1回）", value: `${result.spreadCostPerTrade.toLocaleString()}` },
            { label: "往復手数料（1回）", value: `${result.commissionRoundTrip.toLocaleString()}` },
            { label: "合計コスト（1回）", value: `${result.totalCostPerTrade.toLocaleString()}`, highlight: true },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl p-4 text-center ${item.highlight ? "bg-brand-600 text-white" : "bg-white border border-brand-100"}`}
            >
              <p className={`text-xs mb-1 ${item.highlight ? "text-brand-100" : "text-slate-500"}`}>
                {item.label.replace("{tradesPerMonth}", String(tradesPerMonth))}
              </p>
              <p className={`text-xl font-bold ${item.highlight ? "text-white" : "text-slate-800"}`}>{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-brand-100 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">月間コスト（{tradesPerMonth}回）</p>
            <p className="text-2xl font-bold text-slate-800">{result.monthlyCost.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-brand-100 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">年間コスト（{tradesPerMonth * 12}回）</p>
            <p className="text-2xl font-bold text-amber-700">{result.annualCost.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-4">計算式の説明</h2>
        <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs space-y-2 text-slate-700">
          <p>スプレッドコスト（1回）= スプレッドpips × ロット数 × 1pips価値</p>
          <p>往復手数料 = 片道手数料 × 2</p>
          <p>合計コスト（1回）= スプレッドコスト + 往復手数料</p>
          <p>月間コスト = 合計コスト × 月間取引回数</p>
          <p>年間コスト = 月間コスト × 12</p>
        </div>
      </div>
    </ToolLayout>
  );
}
