import { AlertTriangle } from "lucide-react";

interface MistakeItem {
  title: string;
  desc: string;
}

interface Props {
  items: MistakeItem[];
}

export default function MistakeGrid({ items }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6 not-prose">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-0.5">{item.title}</p>
            <p className="text-xs text-amber-700 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
