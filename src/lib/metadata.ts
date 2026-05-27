import type { Metadata } from "next";

const SITE_NAME = "トレード検証ラボ";
const SITE_URL = "https://trade-kensyo-lab.jp";
const SITE_DESCRIPTION =
  "個人トレーダーのための実務支援メディア。取引の記録・計算・振り返り・改善をツールとノウハウで支援します。FX・CFD・株価指数・暗号資産など幅広い市場に対応。";

export function buildMetadata({
  title,
  description,
  path: urlPath = "/",
  noindex = false,
  ogImage,
}: {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  ogImage?: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc = description ?? SITE_DESCRIPTION;
  const url = `${SITE_URL}${urlPath}`;

  // When ogImage is provided explicitly (e.g. from article frontmatter), use it.
  // Otherwise omit the images key so Next.js picks up opengraph-image.tsx automatically.
  const ogImages = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }]
    : undefined;

  return {
    // absolute bypasses the layout's title.template to prevent "Title | Site | Site" duplication
    title: { absolute: fullTitle },
    description: desc,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      locale: "ja_JP",
      type: "website",
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      ...(ogImages ? { images: [ogImage!] } : {}),
    },
  };
}

export { SITE_NAME, SITE_URL, SITE_DESCRIPTION };
