"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", texto: "Inicio", icono: "M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
  { href: "/reto/", texto: "Reto", icono: "M4 5h16M4 12h16M4 19h10" },
  { href: "/rapidas/", texto: "Rápidas", icono: "M13 2L4 14h7l-1 8 9-12h-7z" },
  { href: "/progreso/", texto: "Progreso", icono: "M4 20V10m6 10V4m6 16v-7m4 7H2" },
  { href: "/perfil/", texto: "Perfil", icono: "M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0" },
];

export default function NavInferior() {
  const ruta = usePathname();
  const activo = (href: string) =>
    href === "/" ? ruta === "/" : ruta.startsWith(href) || (href === "/reto/" && ruta.startsWith("/clase"));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-niebla bg-lino/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-xl justify-between px-2">
        {ITEMS.map((it) => (
          <li key={it.href} className="flex-1">
            <Link
              href={it.href}
              className={`flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition ${
                activo(it.href) ? "text-salvia" : "text-carbon/50 hover:text-carbon"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={it.icono} />
              </svg>
              {it.texto}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
