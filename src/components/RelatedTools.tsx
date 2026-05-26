import ToolCard, { type ToolInfo } from "./ToolCard";

interface Props {
  tools: ToolInfo[];
  className?: string;
}

export default function RelatedTools({ tools, className = "" }: Props) {
  if (tools.length === 0) return null;
  return (
    <aside className={className}>
      <h2 className="text-base font-bold text-slate-800 mb-3">関連ツール</h2>
      <div className="space-y-2">
        {tools.map((tool) => (
          <ToolCard key={tool.href} tool={tool} variant="compact" />
        ))}
      </div>
    </aside>
  );
}
