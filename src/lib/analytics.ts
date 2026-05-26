// ─── GA4 event helper ─────────────────────────────────────────────────────────
// Sends an event to GA4 via gtag() if available.
// Falls back to console.log in development / when GA is not loaded.
// IMPORTANT: Never pass raw trade input values (prices, amounts) as parameters.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function sendEvent(eventName: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
  if (process.env.NODE_ENV === "development") {
    console.log("[analytics]", eventName, params);
  }
}

// ─── Tool name → GA4 event name mapping ───────────────────────────────────────

const TOOL_EVENT_MAP: Record<string, string> = {
  "lot-calculator":            "use_lot_calculator",
  "pips-calculator":           "use_pips_calculator",
  "risk-reward-calculator":    "use_risk_reward_calculator",
  "expectancy-calculator":     "use_expected_value_calculator",
  "profit-loss-calculator":    "use_profit_loss_calculator",
  "spread-cost-calculator":    "use_spread_cost_calculator",
  "trade-journal-template":    "use_trade_journal",
};

// ─── Public tracking functions ────────────────────────────────────────────────

/**
 * Track tool calculation event.
 * Only sends the tool name — never sends raw input values.
 */
export function trackToolCalculate(toolName: string, _inputs: Record<string, unknown>) {
  const eventName = TOOL_EVENT_MAP[toolName] ?? `use_${toolName.replace(/-/g, "_")}`;
  sendEvent(eventName, { tool_name: toolName });
}

/**
 * Track affiliate link clicks.
 * Sends affiliate name only — never sends full URL.
 */
export function trackAffiliateClick(name: string, _url: string) {
  sendEvent("affiliate_click", { affiliate_name: name });
}

/**
 * Track trade journal download / export actions.
 * type: "pdf" | "csv" | "text" | "copy"
 */
export function trackTemplateDownload(type: string) {
  const EVENT_MAP: Record<string, string> = {
    pdf:  "download_trade_journal_pdf",
    csv:  "download_trade_journal_csv",
    text: "download_trade_journal_txt",
    copy: "copy_trade_journal",
  };
  const eventName = EVENT_MAP[type] ?? `download_trade_journal_${type}`;
  sendEvent(eventName, { export_type: type });
}

/**
 * Track internal CTA clicks (e.g. homepage hero buttons).
 */
export function trackInternalCTAClick(label: string, href: string) {
  sendEvent("click_internal_cta", { cta_label: label, destination: href });
}

/**
 * Track article scroll depth milestones (25 / 50 / 75 / 100%).
 */
export function trackArticleScrollDepth(slug: string, depth: number) {
  sendEvent("article_scroll_depth", { article_slug: slug, scroll_depth: depth });
}

/**
 * Track related tool card clicks.
 */
export function trackRelatedToolClick(toolName: string) {
  sendEvent("click_related_tool", { tool_name: toolName });
}
