import Breadcrumbs from "@/components/Breadcrumbs";
import DisclaimerBox from "@/components/DisclaimerBox";
import RelatedTools from "@/components/RelatedTools";
import type { ToolInfo } from "@/components/ToolCard";

interface Props {
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  relatedTools?: ToolInfo[];
  children: React.ReactNode;
}

export default function ToolLayout({
  title,
  description,
  breadcrumbs,
  relatedTools = [],
  children,
}: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </div>

      <DisclaimerBox variant="tool" className="mb-8" />

      <div className="space-y-8">{children}</div>

      {relatedTools.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <RelatedTools tools={relatedTools} />
        </div>
      )}

      <DisclaimerBox className="mt-8" />
    </div>
  );
}
