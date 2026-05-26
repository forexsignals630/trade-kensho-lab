import Breadcrumbs from "@/components/Breadcrumbs";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "編集方針",
  description: "トレード検証ラボの記事・コンテンツ制作における編集方針を公開しています。",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "編集方針" }]} />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">編集方針</h1>
        <p className="text-slate-500 text-sm">最終更新: 2024年5月</p>
      </div>

      <div className="prose max-w-none space-y-6">
        <section>
          <h2>基本方針</h2>
          <p>
            トレード検証ラボは、個人トレーダーの実務に役立つ正確で公正な情報提供を使命としています。
            以下の基本方針に従ってコンテンツを制作・管理しています。
          </p>
          <ul>
            <li>事実確認を徹底し、情報の正確性を最優先する</li>
            <li>投資助言・売買推奨・収益保証を一切含まない</li>
            <li>アフィリエイト収益がコンテンツの内容に影響しない</li>
            <li>読者の利益を広告主の利益より優先する</li>
            <li>古い情報は定期的に見直し・更新する</li>
          </ul>
        </section>

        <section>
          <h2>コンテンツの作成プロセス</h2>
          <h3>情報源</h3>
          <p>
            ツールの計算ロジックは公式文献・学術的な統計手法に基づきます。
            記事に引用する外部情報は、公式発表・信頼性の高いソースを優先します。
          </p>
          <h3>レビュープロセス</h3>
          <p>
            計算ツールについては、複数のテストケースで検証を行い公開します。
            記事については内部レビューを経て公開します。
          </p>
          <h3>更新方針</h3>
          <p>
            情報が古くなった場合や事実誤認が判明した場合は、速やかに修正・更新します。
            記事の最終更新日をページに表示します。
          </p>
        </section>

        <section>
          <h2>YMYLコンテンツへの対応</h2>
          <p>
            金融・投資に関するコンテンツ（YMYL: Your Money Your Life）は特に慎重に取り扱います。
            当サイトのコンテンツは<strong>投資助言ではなく情報提供・計算支援</strong>であることを
            すべてのページで明示します。
          </p>
          <p>
            実際の投資・取引で生じた損失について、当サイトは一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2>広告・アフィリエイトについて</h2>
          <p>
            当サイトは一部の記事でアフィリエイトリンクを使用しています。
            アフィリエイト収益はサイト運営費に充てられますが、コンテンツの客観性・独立性には影響しません。
          </p>
          <p>
            アフィリエイトリンクを含む記事には「広告開示」を表示しています。
            詳しくは<a href="/advertising-policy">広告掲載方針</a>をご参照ください。
          </p>
        </section>

        <section>
          <h2>訂正・問い合わせ</h2>
          <p>
            情報の誤りや改善提案がある場合は、
            <a href="/contact">お問い合わせ</a>よりご連絡ください。
            確認のうえ、必要に応じて修正を行います。
          </p>
        </section>
      </div>
    </div>
  );
}
