export type ArticleCategory =
  | "トレード記録"
  | "リスク管理"
  | "検証・バックテスト"
  | "検証・分析"
  | "ツール解説"
  | "TradingView"
  | "VPS運用"
  | "比較・レビュー"
  | "テンプレート"
  | "初心者向け基礎";

export interface ArticleFAQItem {
  question: string;
  answer: string;
}

export interface ArticleFrontmatter {
  title: string;
  description: string;
  category: ArticleCategory;
  publishedAt: string;
  updatedAt?: string;
  readingTime?: number;
  draft?: boolean;
  noindex?: boolean;
  tags?: string[];
  ogImage?: string;
  author?: string;
  isAffiliate?: boolean;
  isYMYLAdjacent?: boolean;
  relatedTools?: string[];
  relatedArticles?: string[];
  faq?: ArticleFAQItem[];
}

export interface Article extends ArticleFrontmatter {
  slug: string;
  content: string;
}

export interface ArticleMeta extends ArticleFrontmatter {
  slug: string;
}
