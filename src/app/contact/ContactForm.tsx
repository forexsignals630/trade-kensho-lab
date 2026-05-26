"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle, Info } from "lucide-react";
import Link from "next/link";

type FormState = "idle" | "submitted";

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white";

const labelCls = "block text-sm font-medium text-slate-700 mb-1.5";

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ── フォーム送信処理（現在は仮実装）──────────────────────────────
    // 実際の送信処理はメールフォームサービス連携後に実装予定です。
    setState("submitted");
  };

  if (state === "submitted") {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-6 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">送信が完了しました</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-5">
          お問い合わせありがとうございます。<br />
          内容を確認後、通常3〜5営業日以内にご返信します。<br />
          <span className="text-xs text-slate-400 mt-1 block">※ 現在フォームは確認用の仮実装です。送信内容は実際には届きません。</span>
        </p>
        <button
          onClick={() => setState("idle")}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium hover:underline"
        >
          ← 入力画面に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">

      {/* Card header */}
      <div className="flex items-center gap-3 bg-slate-50 border-b border-slate-100 px-6 py-4">
        <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4 text-brand-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">お問い合わせフォーム</h2>
          <p className="text-xs text-slate-400 mt-0.5">内容確認後、通常3〜5営業日以内にご返信します。</p>
        </div>
      </div>

      {/* Provisional notice */}
      <div className="flex items-start gap-2 mx-6 mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          現在フォームは仮実装です。送信しても実際にはメールが届きません。お急ぎの場合は別途ご連絡手段をご用意ください。
        </p>
      </div>

      <form className="px-6 py-5 space-y-5" onSubmit={handleSubmit}>

        {/* お名前 */}
        <div>
          <label className={labelCls}>
            お名前 <span className="text-slate-400 font-normal text-xs">（任意）</span>
          </label>
          <input
            type="text"
            placeholder="山田太郎"
            className={inputCls}
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label className={labelCls}>
            メールアドレス <span className="text-red-500 text-xs">*必須</span>
          </label>
          <input
            type="email"
            placeholder="example@email.com"
            required
            className={inputCls}
          />
        </div>

        {/* お問い合わせ種別 */}
        <div>
          <label className={labelCls}>
            お問い合わせ種別 <span className="text-red-500 text-xs">*必須</span>
          </label>
          <select required className={`${inputCls} appearance-none`}>
            <option value="">選択してください</option>
            <option value="article">記事内容について</option>
            <option value="bug">ツールの不具合について</option>
            <option value="media">広告・掲載について</option>
            <option value="other">その他</option>
          </select>
        </div>

        {/* 件名 */}
        <div>
          <label className={labelCls}>
            件名 <span className="text-red-500 text-xs">*必須</span>
          </label>
          <input
            type="text"
            placeholder="お問い合わせの件名を入力してください"
            required
            className={inputCls}
          />
        </div>

        {/* お問い合わせ内容 */}
        <div>
          <label className={labelCls}>
            お問い合わせ内容 <span className="text-red-500 text-xs">*必須</span>
          </label>
          <textarea
            rows={6}
            placeholder="お問い合わせ内容を入力してください"
            required
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* 個人情報の取り扱い */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            ご入力いただいた個人情報は、お問い合わせへの回答のために利用します。
            詳しくは
            <Link href="/privacy-policy" className="text-brand-600 hover:underline mx-0.5">
              プライバシーポリシー
            </Link>
            をご確認ください。
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          <Send className="w-4 h-4" />
          送信する
        </button>

      </form>
    </div>
  );
}
