const TONE_CLASSES = {
  accent: "border-accent/50 text-accent",
  danger: "border-danger/50 text-danger",
  neutral: "border-line text-text-dim",
} as const;

export function Tag({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof TONE_CLASSES;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[0.65rem] leading-none whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
