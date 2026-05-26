"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { calculateDrawdownRecovery, getDrawdownTable } from "@/lib/calculations/drawdown";
import { trackToolCalculate } from "@/lib/analytics";

const RELATED_TOOLS = [
  { title: "ロット計算ツール", description: "リスク管理の基本", href: "/tools/lot-calculator", icon: "🧮" },
  { title: "リスク・オブ・ルイン", description: "資産曲線シミュレーション", href: "/tools/risk-of-ruin-simulator", icon: "🎲" },
];

const ddTable = getDrawdownTable();

export default function DrawdownRecoveryCalculatorPage() {
  const [drawdown, setDrawdown] = useState(20);

  const recovery = calculateDrawdownRecovery(drawdown);

  const handleCalculate = () => {
    trackToolCalculate("drawdown-recovery-calculator", { drawdown });
  };

  return (
    <ToolLayout
      title="ドローダウン回復計算ツール"
      description="ドローダウン（資産の目減り）から元の資産水準に戻るために必要な利益率を計算します。ドローダウンが大きいほど、回復に必要な利益率は急激に増加します。"
      breadcrumbs={[
        { label: "無料ツール", href: "/tools" },
        { label: "ドローダウン回復計算" },
      ]}
      relatedTools={RELATED_TOOLS}
    >
      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-5">入力項目</h2>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">ドローダウン率（%）</label>
          <input
            type="number"
            value={drawdown}
            onChange={(e) => setDrawdown(Number(e.target.value))}
            onBlur={handleCalculate}
            min={0.1}
            max={99.9}
            step={0.1}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <input
            type="range"
            value={drawdown}
            onChange={(e) => setDrawdown(Number(e.target.value))}
            min={1}
            max={90}
            step={1}
            className="w-full mt-3 accent-brand-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-0.5">
            <span>1%</span>
            <span>90%</span>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-5">計算結果</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-brand-100 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">ドローダウン率</p>
            <p className="text-3xl font-bold text-slate-800">{drawdown}%</p>
          </div>
          <div className="bg-brand-600 rounded-xl p-4 text-center">
            <p className="text-xs text-brand-100 mb-1">回復に必要な利益率</p>
            <p className="text-3xl font-bold text-white">{recovery}%</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-4 p-3 bg-white rounded-lg">
          資産が{drawdown}%減少した場合、元の水準に戻るには残資産から<strong className="text-slate-800">{recovery}%</strong>の利益が必要です。
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-4">ドローダウン別 回復必要率一覧</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 border-b border-slate-200">ドローダウン率</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 border-b border-slate-200">回復に必要な利益率</th>
              </tr>
            </thead>
            <tbody>
              {ddTable.map((row) => (
                <tr
                  key={row.drawdownPercent}
                  className={`border-b border-slate-100 ${row.drawdownPercent === Math.round(drawdown) ? "bg-brand-50" : "hover:bg-slate-50"}`}
                >
                  <td className="px-4 py-3 text-slate-700 font-medium">{row.drawdownPercent}%</td>
                  <td className={`px-4 py-3 text-right font-bold ${
                    row.drawdownPercent >= 50 ? "text-red-600" :
                    row.drawdownPercent >= 30 ? "text-amber-600" : "text-slate-800"
                  }`}>
                    {row.recoveryPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-4">計算式の説明</h2>
        <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs text-slate-700">
          <p>回復必要率 = ドローダウン率 ÷ (1 - ドローダウン率) × 100</p>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          例：30%のドローダウンが発生した場合、残資産は元の70%になります。
          元の100%に戻すには 30 ÷ 70 = 約42.9%の利益が必要です。
          ドローダウンが大きいほど回復コストは非線形に増加するため、損失を小さく抑えることが重要です。
        </p>
      </div>
    </ToolLayout>
  );
}
