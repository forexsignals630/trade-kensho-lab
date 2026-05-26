export interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  description: string;
  category: 'tradingview' | 'fxreplay' | 'vps' | 'tool' | 'peripheral';
}

export const AFFILIATE_LINKS: AffiliateLink[] = [
  {
    id: 'tradingview-pro',
    name: 'TradingView Pro',
    url: 'https://tradingview.com',
    description: 'チャート分析・アラート・Pine Script対応の有料プラン',
    category: 'tradingview',
  },
  {
    id: 'tradingview-pro-plus',
    name: 'TradingView Pro+',
    url: 'https://tradingview.com',
    description: 'インジケーター数・アラート数が拡張された中級者向けプラン',
    category: 'tradingview',
  },
  {
    id: 'fxreplay',
    name: 'FX Replay',
    url: 'https://fxreplay.com',
    description: '過去チャートでのバックテスト・検証ツール',
    category: 'fxreplay',
  },
  {
    id: 'conoha-vps',
    name: 'ConoHa VPS',
    url: 'https://www.conoha.jp/vps/',
    description: 'MT4/MT5の自動売買に適した国内VPSサービス',
    category: 'vps',
  },
  {
    id: 'xserver-vps',
    name: 'Xserver VPS',
    url: 'https://vps.xserver.ne.jp/',
    description: '高速・安定のVPSサービス。EA運用に最適',
    category: 'vps',
  },
];

export function getAffiliateLinkById(id: string): AffiliateLink | undefined {
  return AFFILIATE_LINKS.find((link) => link.id === id);
}

export function getAffiliateLinksByCategory(category: AffiliateLink['category']): AffiliateLink[] {
  return AFFILIATE_LINKS.filter((link) => link.category === category);
}
