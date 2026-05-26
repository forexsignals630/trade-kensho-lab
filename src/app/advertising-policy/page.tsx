import Breadcrumbs from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "広告掲載方針",
  description: "トレード検証ラボの広告・アフィリエイトに関する方針を公開しています。",
  path: "/advertising-policy",
});

export default function AdvertisingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "広告掲載方針" }]} />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">広告掲載方針</h1>
        <p className="text-slate-500 text-sm">最終更新: 2024年5月</p>
      </div>

      <div className="prose max-w-none space-y-6">
        <section>
          <h2>広告収益の位置づけ</h2>
          <p>
            当サイトはアフィリエイトプログラムおよびディスプレイ広告を通じて収益を得ています。
            これらの収益はサイトの運営・コンテンツ制作費に充当されます。
          </p>
        </section>

        <section>
          <h2>アフィリエイトリンクについて</h2>
          <p>
            一部の記事には、TradingView・バックテストツール・VPSサービスなどへのアフィリエイトリンクが含まれます。
            アフィリエイトリンクを経由して商品をご購入いただくと、当サイトに紹介報酬が発生する場合があります。
          </p>
          <p>
            アフィリエイトリンクを含む記事には冒頭に「広告開示」を表示しています。
            アフィリエイトリンクには <code>rel="sponsored nofollow"</code> 属性を付与しています。
          </p>
        </section>

        <section>
          <h2>コンテンツの独立性</h2>
          <p>
            アフィリエイト収益は当サイトの評価・推薦の内容に影響しません。
            紹介するサービス・ツールは編集部が独立して評価しており、
            広告主から対価を受け取ることで内容が変わることはありません。
          </p>
          <p>
            実際に当サイトが推奨する基準：
          </p>
          <ul>
            <li>個人トレーダーの実務で実際に有用であること</li>
            <li>信頼性・実績のあるサービスであること</li>
            <li>料金体系が透明であること</li>
          </ul>
        </section>

        <section>
          <h2>Google AdSenseについて</h2>
          <p>
            当サイトはGoogle AdSenseを利用して広告を表示する場合があります。
            Googleは訪問者の閲覧情報に基づいて広告を表示することがあります。
            詳しくは<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Googleのプライバシーポリシー</a>をご確認ください。
          </p>
        </section>

        <section>
          <h2>お問い合わせ</h2>
          <p>
            広告・掲載に関するお問い合わせは<a href="/contact">こちら</a>からお願いします。
          </p>
        </section>
      </div>
    </div>
  );
}
