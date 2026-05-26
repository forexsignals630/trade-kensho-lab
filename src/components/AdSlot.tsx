interface Props {
  slot?: string;
  className?: string;
}

export default function AdSlot({ slot, className = "" }: Props) {
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";

  if (!enabled) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 min-h-[90px] text-xs text-slate-400 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
