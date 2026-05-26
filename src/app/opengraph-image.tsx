import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// ── Load Noto Sans JP Bold from Google Fonts CDN ────────────────────────────
async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        },
      }
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const fontData = await loadFont();

  const TAGS = ["ロット計算", "トレード日誌", "リスクリワード", "期待値"];
  const BRAND = "#2563eb";
  const BRAND_LIGHT = "#eff6ff";
  const BRAND_BORDER = "#bfdbfe";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#f8fafc",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "72px 88px",
          position: "relative",
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "8px",
            background: BRAND,
          }}
        />

        {/* Top-right decoration */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: BRAND_LIGHT,
            opacity: 0.6,
          }}
        />

        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "52px",
          }}
        >
          {/* Icon box */}
          <div
            style={{
              width: "52px",
              height: "52px",
              background: BRAND,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="9"
                y="3"
                width="6"
                height="4"
                rx="1"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "#1e293b",
              letterSpacing: "-0.5px",
            }}
          >
            トレード検証ラボ
          </span>
        </div>

        {/* Main copy */}
        <div
          style={{
            fontSize: "62px",
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.2,
            marginBottom: "40px",
            letterSpacing: "-1px",
          }}
        >
          記録・計算・検証を、
          <br />
          もっと実務的に。
        </div>

        {/* Tag pills */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          {TAGS.map((tag) => (
            <span
              key={tag}
              style={{
                background: BRAND_LIGHT,
                color: BRAND,
                padding: "10px 24px",
                borderRadius: "9999px",
                fontSize: "20px",
                fontWeight: 600,
                border: `1.5px solid ${BRAND_BORDER}`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom note */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "96px",
            fontSize: "15px",
            color: "#94a3b8",
            letterSpacing: "0.5px",
          }}
        >
          記録・計算・検証支援を目的とした実務メディア
        </div>

        {/* Bottom-right URL hint */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "56px",
            fontSize: "15px",
            color: "#cbd5e1",
          }}
        >
          trade-kencho-lab.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Noto Sans JP", data: fontData, weight: 700 }]
        : [],
    }
  );
}
