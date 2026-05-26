import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/articles/lot-calculator-guide",
        destination: "/articles/how-to-use-lot-calculator",
        permanent: true,
      },
      {
        source: "/articles/expected-value-basics",
        destination: "/articles/how-to-use-expected-value-calculator",
        permanent: true,
      },
      {
        source: "/articles/lot-calculation-basics",
        destination: "/articles/how-to-use-lot-calculator",
        permanent: true,
      },
      {
        source: "/articles/risk-reward-explained",
        destination: "/articles/how-to-use-risk-reward-calculator",
        permanent: true,
      },
      {
        source: "/articles/trade-journal-items",
        destination: "/articles/trade-journal-basics",
        permanent: true,
      },
      {
        source: "/articles/trade-journal-continuation-tips",
        destination: "/articles/trade-review-weekend",
        permanent: true,
      },
      {
        source: "/articles/tradingview-plans-comparison",
        destination: "/articles/tradingview-free-vs-paid",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
