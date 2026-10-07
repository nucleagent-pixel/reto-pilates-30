export default function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3 text-tinta/60">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-arena border-t-terracota" />
      <p className="text-sm">{texto}</p>
    </div>
  );
}
