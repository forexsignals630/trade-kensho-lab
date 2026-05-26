"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  items: FAQItem[];
  className?: string;
}

export default function FAQSection({ items, className = "" }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section className={className}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="border border-slate-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex items-center justify-between w-full px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-brand-500 font-bold text-sm shrink-0 mt-0.5">Q</span>
                <span className="text-sm font-medium text-slate-800">{item.question}</span>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 shrink-0 ml-3 transition-transform",
                  openIndex === index && "rotate-180"
                )}
              />
            </button>
            {openIndex === index && (
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
                <div className="flex gap-3">
                  <span className="text-green-500 font-bold text-sm shrink-0 mt-0.5">A</span>
                  <div className="space-y-2">
                    {item.answer.split("\n\n").map((para, pi) => (
                      <p key={pi} className="text-sm text-slate-600 leading-relaxed">
                        {para.split("\n").map((line, li, arr) => (
                          <span key={li}>{line}{li < arr.length - 1 && <br />}</span>
                        ))}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
