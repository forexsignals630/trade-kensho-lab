"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Grid3X3, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "無料ツール", href: "/tools" },
  {
    label: "カテゴリ",
    children: [
      { label: "トレード日誌", href: "/categories/trade-journal" },
      { label: "リスク管理", href: "/categories/risk-management" },
      { label: "検証・分析", href: "/categories/analysis" },
      { label: "ツール解説", href: "/categories/tools" },
      { label: "すべての記事", href: "/articles" },
    ],
  },
  { label: "記事一覧", href: "/articles" },
  { label: "編集方針", href: "/editorial-policy" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" style={{ gap: "11px" }}>
            <div className="w-7 h-7 bg-brand-600 flex items-center justify-center" style={{ borderRadius: "8px" }}>
              <ClipboardCheck className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="whitespace-nowrap text-slate-900" style={{ fontSize: "17px", fontWeight: 700 }}>
              トレード検証ラボ
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.label} className="relative">
                  <button
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-slate-600 hover:text-brand-600 rounded-md hover:bg-brand-50 transition-colors"
                  >
                    {item.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {openDropdown === item.label && (
                    <div
                      onMouseEnter={() => setOpenDropdown(item.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                      className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm text-slate-600 hover:text-brand-600 rounded-md hover:bg-brand-50 transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/tools"
              className="hidden sm:flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Grid3X3 className="w-4 h-4" />
              ツール一覧
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-brand-600 rounded-md hover:bg-slate-100 transition-colors"
              aria-label="メニューを開く"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 text-sm text-slate-600 hover:text-brand-600 rounded-md hover:bg-brand-50 transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-3 py-2 text-sm text-slate-600 hover:text-brand-600 rounded-md hover:bg-brand-50 transition-colors",
                    item.label === "無料ツール" && "font-medium"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/tools"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                <Grid3X3 className="w-4 h-4" />
                ツール一覧を見る
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
