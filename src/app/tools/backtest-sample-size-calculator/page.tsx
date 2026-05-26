"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { calculateBacktestSampleSize, type ConfidenceLevel } from "@/lib/calculations/backtestSample";
import { trackToolCalculate } from "@/lib/analytics";

const RELATED_TOOLS = [
  { title: "期待値計算ツール", description: "戦略の期待値を計算", href: "/tools/expectancy-calculator", icon: "📊" },
  { title: "リスクリワード計算", description: "RR比を計算", href: "/tools/risk-reward-calculator", icon: "⚖️" },
];

export default function BacktestSampleSizeCalculatorPage() {
  const [expectedWinRate, setExpectedWinRate] = useState(50);
  const [marginOfError, setMarginOfError] = useState(5);
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>(95);

  const result = calculateBacktestSampleSize({ expectedWinRate, marginOfError, confidenceLevel });

  const handleCalculate = () => {
    trackToolCalculate("backtest-sample-size-calculator", { expectedWinRate, marginOfError, confidenceLevel });
  };

  return (
    <ToolLayout
      title="バックテスト サンプル数計算ツール"
      description="想定勝率・許容誤差・信頼水準から統計的に必要なバックテスト試行回数を計算します。"
      breadcrumbs={[
        { label: "無料ツール", href: "/tools" },
        { label: "バックテストサンプル数計算" },
      ]}
      relatedTools={RELATED_TOOLS}
    >
      {/* Important caveat */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-1">重要な注意事項</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          この計算ツールは統計的なサンプルサイズの目安を示すものです。バックテストの有効性を保証するものではなく、
          過去データへの過学習・市場環境の変化・フォワードテストとの乖離などの問題は考慮されていません。
          あくまで参考値としてご利用ください。
        </p>
      </div>

      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-5">入力項目</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">想定勝率（%）</label>
            <input
              type="number"
              value={expectedWinRate}
              onChange={(e) => setExpectedWinRate(Number(e.target.value))}
              onBlur={handleCalculate}
              min={1}
              max={99}
              step={1}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <p className="text-xs text-slate-400 mt-1">50%前後が最も多くのサンプルを要します</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">許容誤差（%）</label>
            <input
              type="number"
              value={marginOfError}
              onChange={(e) => setMarginOfError(Number(e.target.value))}
              onBlur={handleCalculate}
              min={0.1}
              max={50}
              step={0.5}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <p className="text-xs text-slate-400 mt-1">小さいほど精度が高く、より多くのサンプルが必要</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">信頼水準</label>
            <select
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(Number(e.target.value) as ConfidenceLevel)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value={90}>90%（Z = 1.645）</option>
              <option value={95}>95%（Z = 1.96）</option>
              <option value={99}>99%（Z = 2.576）</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-5">計算結果</h2>
        <div className="flex flex-col items-center py-4">
          <p className="text-sm text-slate-600 mb-2">必要なバックテスト試行回数（目安）</p>
          <div className="bg-brand-600 rounded-2xl px-12 py-6 text-center mb-4">
            <p className="text-5xl font-bold text-white">{result.sampleSize.toLocaleString()}</p>
            <p className="text-brand-200 text-sm mt-1">トレード</p>
          </div>
          <p className="text-xs text-slate-500 text-center max-w-sm">
            勝率{result.p}% ± {result.e}% の精度で推定するために、信頼水準{confidenceLevel}%では
            約 {result.sampleSize.toLocaleString()} 回のサンプルが理論上必要です。
          </p>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-bold text-slate-800 mb-4">計算式の説明</h2>
        <div className="bg-slate-50 rounded-lg p-4 font-mono text-xs space-y-2 text-slate-700">
          <p>n = Z² × p × (1-p) / E²</p>
          <p className="text-slate-500">n: 必要サンプル数</p>
          <p className="text-slate-500">Z: 信頼水準のz値（90%=1.645, 95%=1.96, 99%=2.576）</p>
          <p className="text-slate-500">p: 想定勝率（小数）</p>
          <p className="text-slate-500">E: 許容誤差（小数）</p>
        </div>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>免責：</strong>この計算は二項比率（勝率）の推定精度のみを考慮しています。
            バックテストの信頼性には他にも多くの要因（過学習、データ品質、取引コスト、スリッページ等）が影響します。
            統計的に十分なサンプル数があっても、フォワード成績を保証するものではありません。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
