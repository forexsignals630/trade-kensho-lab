"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { runMultipleSimulations, type SimulationResult } from "@/lib/calculations/riskOfRuin";
import { trackToolCalculate } from "@/lib/analytics";
import { clampNumber } from "@/lib/utils";

const RELATED_TOOLS = [
  { title: "ドローダウン回復計算", description: "DDから回復に必要な利益率", href: "/tools/drawdown-recovery-calculator", icon: "📉" },
  { title: "期待値計算ツール", description: "戦略の期待値を計算", href: "/tools/expectancy-calculator", icon: "📊" },
];

function EquityCurveChart({ results, initialCapital }: { results: SimulationResult[]; initialCapital: number }) {
  const allValues = results.flatMap((r) => r.equityCurve);
  const maxVal = Math.max(...allValues, initialCapital);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;
  const numTrades = results[0]?.equityCurve.length ?? 1;

  const W = 600;
  const H = 200;

  const toX = (i: number) => (i / (numTrades - 1)) * W;
  const toY = (v: number) => H - ((v - minVal) / range) * H;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48 bg-slate-900 rounded-xl" preserveAspectRatio="none">
      {/* baseline */}
      <line
        x1={0} y1={toY(initialCapital)}
        x2={W} y2={toY(initialCapital)}
        stroke="#334155" strokeWidth={1} strokeDasharray="4 4"
      />
      {results.map((r, idx) => {
        const d = r.equityCurve
          .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`)
          .join(" ");
        const color = r.ruined ? "#ef4444" : "#3b82f6";
        return (
          <path key={idx} d={d} fill="none" stroke={color} strokeWidth={1.5} opacity={0.6} />
        );
      })}
    </svg>
  );
}

export default function RiskOfRuinSimulatorPage() {
  const [winRate, setWinRate] = useState(50);
  const [rrRatio, setRrRatio] = useState(1.5);
  const [riskPerTradePercent, setRiskPerTradePercent] = useState(2);
  const [initialCapital, setInitialCapital] = useState(500000);
  const [numTrades, setNumTrades] = useState(200);
  const [results, setResults] = useState<SimulationResult[] | null>(null);

  const runSimulation = () => {
    trackToolCalculate("risk-of-ruin-simulator", { winRate, rrRatio, riskPerTradePercent, initialCapital, numTrades });
    const sims = runMultipleSimulations({
      winRate: clampNumber(winRate, 0, 100),
      rrRatio: clampNumber(rrRatio, 0.01, 100),
      riskPerTradePercent: clampNumber(riskPerTradePercent, 0.01, 100),
      initialCapital: clampNumber(initialCapital, 1, 1_000_000_000),
      numTrades: clampNumber(numTrades, 1, 10000),
    }, 20);
    setResults(sims);
  };

  const ruinedCount = results?.filter((r) => r.ruined).length ?? 0;
  const ruinRate = results ? (ruinedCount / results.length * 100).toFixed(0) : null;

  return (
    <ToolLayout
      title="リスク・オブ・ルイン シミュレーター"
      description="勝率・RR比・リスク率の設定でモンテカルロ風のシミュレーションを実行します。将来の損益を予測するものではありません。"
      breadcrumbs={[
        { label: "無料ツール", href: "/tools" },
        { label: "リスク・オブ・ルインシミュレーター" },
      ]}
      relatedTools={RELATED_TOOLS}
    >
      {/* STRONG Disclaimer */}
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
        <p className="text-sm font-bold text-red-800 mb-2">重要な免責事項</p>
        <ul className="text-xs text-red-700 space-y-1 leading-relaxed list-disc list-inside">
          <li>これは将来の損益を予測するものではありません</li>
          <li>固定のパラメータを使った擬似乱数シミュレーションであり、実際の市場とは異なります</li>
          <li>スプレッド・スリッページ・心理的要因などは考慮されていません</li>
          <li>この結果をもとに実際の取引判断を行わないでください</li>
        </ul>
      </div>

      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-5">シミュレーション設定</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-6">
          {[
            { label: "勝率（%）", value: winRate, setter: setWinRate, min: 1, max: 99, step: 1 },
            { label: "RR比", value: rrRatio, setter: setRrRatio, min: 0.1, max: 20, step: 0.1 },
            { label: "1回リスク率（%）", value: riskPerTradePercent, setter: setRiskPerTradePercent, min: 0.1, max: 100, step: 0.1 },
            { label: "初期資金", value: initialCapital, setter: setInitialCapital, min: 1000, max: 1000000000, step: 10000 },
            { label: "試行回数（トレード数）", value: numTrades, setter: setNumTrades, min: 10, max: 5000, step: 10 },
          ].map(({ label, value, setter, min, max, step }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                min={min}
                max={max}
                step={step}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          ))}
        </div>
        <button
          onClick={runSimulation}
          className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          シミュレーション実行（20パターン）
        </button>
      </div>

      {/* Results */}
      {results && (
        <>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-bold text-slate-800 mb-4">資産曲線（20パターン）</h2>
            <p className="text-xs text-slate-500 mb-3">
              青: 初期資金の50%以上維持  赤: 50%以下（破産判定）  点線: 初期資金水準
            </p>
            <EquityCurveChart results={results} initialCapital={initialCapital} />
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h2 className="font-bold text-slate-800 mb-4">シミュレーション集計</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "シミュレーション数", value: `${results.length}パターン` },
                { label: "破産率（50%以下）", value: `${ruinRate}%`, alert: Number(ruinRate) >= 50 },
                { label: "平均最終資産", value: `${Math.round(results.reduce((a, r) => a + r.finalCapital, 0) / results.length).toLocaleString()}` },
                { label: "平均最大DD", value: `${(results.reduce((a, r) => a + r.maxDrawdown, 0) / results.length).toFixed(1)}%` },
              ].map((item) => (
                <div key={item.label} className={`rounded-xl p-4 text-center ${item.alert ? "bg-red-100 border border-red-200" : "bg-white border border-slate-200"}`}>
                  <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                  <p className={`text-xl font-bold ${item.alert ? "text-red-700" : "text-slate-800"}`}>{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4 p-3 bg-white rounded-lg border border-slate-200">
              これらの数値は固定パラメータによる擬似シミュレーションの結果です。
              実際の取引結果とは大きく異なる可能性があります。投資判断の根拠にしないでください。
            </p>
          </div>
        </>
      )}

      {/* Explanation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-4">ツールの説明</h2>
        <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
          <p>
            リスク・オブ・ルイン（Risk of Ruin）とは、資金管理ルールを継続した場合に資産が一定水準以下になる確率の概念です。
            このツールでは、指定したパラメータで20パターンのシミュレーションを実行し、資産推移を可視化します。
          </p>
          <p>
            <strong>破産判定：</strong>初期資金の50%以下になったシナリオを「破産」としてカウントしています（赤い線）。
          </p>
          <p>
            <strong>シミュレーションの限界：</strong>このツールは固定確率の独立試行を前提としています。
            実際の市場は連続した価格変動があり、各トレードは独立ではありません。
            あくまで資金管理の考え方を学ぶための参考ツールです。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
