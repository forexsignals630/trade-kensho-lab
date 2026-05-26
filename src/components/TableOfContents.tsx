"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  className?: string;
}

export default function TableOfContents({ className }: Props) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("article h2, article h3"));
    const tocItems: TocItem[] = headings.map((el) => {
      if (!el.id) {
        el.id = el.textContent?.replace(/\s+/g, "-").toLowerCase() ?? Math.random().toString(36).slice(2);
      }
      return {
        id: el.id,
        text: el.textContent ?? "",
        level: parseInt(el.tagName[1]),
      };
    });
    setItems(tocItems);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className={cn("text-sm", className)} aria-label="目次">
      <p className="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wide">目次</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: item.level === 3 ? "1rem" : "0" }}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block text-xs leading-snug transition-colors py-0.5",
                activeId === item.id
                  ? "text-brand-600 font-medium"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
