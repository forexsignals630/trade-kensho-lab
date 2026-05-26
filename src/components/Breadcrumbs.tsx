import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: Props) {
  const all = [{ label: "ホーム", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `https://trade-kencho-lab.com${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="パンくずリスト" className="flex items-center flex-wrap gap-1 text-xs text-slate-500">
        {all.map((item, index) => (
          <span key={index} className="flex items-center gap-1">
            {index === 0 && <Home className="w-3 h-3" />}
            {index > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
            {item.href && index < all.length - 1 ? (
              <Link href={item.href} className="hover:text-brand-600 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={index === all.length - 1 ? "text-slate-700 font-medium" : ""}>
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
