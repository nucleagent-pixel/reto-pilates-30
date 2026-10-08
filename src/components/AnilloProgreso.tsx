export default function AnilloProgreso({ valor, total }: { valor: number; total: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = total ? Math.min(valor / total, 1) : 0;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#DCE0D6" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#55684F"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-titulo text-3xl">{valor}</span>
        <span className="text-xs text-carbon/60">de {total} días</span>
      </div>
    </div>
  );
}
