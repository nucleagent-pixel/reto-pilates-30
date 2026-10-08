import { MARCA } from "@/lib/marca";

/** Logotipo de texto: nombre en condensada pesada, "pilates" ligera debajo. */
export default function Marca({ claro = false, grande = false }: { claro?: boolean; grande?: boolean }) {
  return (
    <div className={`font-titulo leading-none ${claro ? "text-white" : "text-carbon"}`}>
      <p className={`${grande ? "text-5xl" : "text-2xl"} font-bold tracking-tight`}>{MARCA.marca.toLowerCase()}</p>
      <p className={`${grande ? "text-2xl" : "text-sm"} font-light tracking-[0.3em] ${claro ? "text-white/85" : "text-salvia"}`}>
        pilates
      </p>
    </div>
  );
}

export function AvatarLaura({ tam = 48 }: { tam?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MARCA.avatar}
      alt={MARCA.instructora}
      width={tam}
      height={tam}
      className="shrink-0 rounded-full object-cover ring-2 ring-white"
      style={{ width: tam, height: tam }}
    />
  );
}
