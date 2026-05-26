"use client";

import { ExternalLink } from "lucide-react";
import { trackAffiliateClick } from "@/lib/analytics";

interface Props {
  href: string;
  name: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
}

export default function AffiliateButton({
  href,
  name,
  children,
  className = "",
  variant = "primary",
}: Props) {
  const handleClick = () => {
    trackAffiliateClick(name, href);
  };

  const baseClasses =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors";

  const variantClasses = {
    primary: "bg-brand-600 hover:bg-brand-700 text-white",
    secondary: "bg-slate-800 hover:bg-slate-900 text-white",
    outline: "border-2 border-brand-600 text-brand-600 hover:bg-brand-50",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
      <ExternalLink className="w-4 h-4" />
    </a>
  );
}
