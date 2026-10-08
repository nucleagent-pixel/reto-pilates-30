import type { Categoria, Rutina } from "./tipos";

// Las 30 clases del reto: 21 días + 9 rutinas rápidas.
// Desde el panel de admin → Clases → "Cargar las 30 clases" se guardan en la base de datos.
// Después puedes editar cualquier clase desde el panel sin tocar este archivo.

const drive = (id: string) => `https://drive.google.com/file/d/${id}/view`;

type Semilla = [orden: number, titulo: string, categoria: Categoria, videoId: string, duracion?: string];

const DIAS: Semilla[] = [
  [1, "Cuerpo entero", "cuerpo", "1T1Emfh7Z0B2oEthq5O6kQxItjKSM3cPe"],
  [2, "Piernas y glúteos", "piernas", "1tBGEJQaC9r5PB56WaOsLKmN6b0QjolRj"],
  [3, "Abdomen, oblicuos y lumbar", "abdomen", "1GNdYYX-8RnTjIqeJxvBeLE4LPved3a7l"],
  [4, "Movilidad de columna", "movilidad", "1Op0kmXFx6c3wXJBHGOats9MnulByP4Td"],
  [5, "Brazos, hombros y espalda", "brazos", "1fnc7I3meg8cIC9hyb_2tm-_J6APZlB1Z"],
  [6, "Movilidad de cadera", "movilidad", "1sHpNvUHc7AB5nsAjV5fCf5SRr05lj7Cm"],
  [7, "Pilates de pie", "pie", "17oW53qFMlsyQAMSFwCot23IcGnq_ZLIr"],
  [8, "Estiramientos yin", "estiramiento", "1RtUgB9Yu4dxqImJd-ZDb8lMRbhyLUTmR"],
  [9, "Cuerpo entero", "cuerpo", "1ycVAu0DM0tXieJYM2QfCJYgf8AoxZixT"],
  [10, "Cuerpo entero y coordinación", "cuerpo", "144dRsBcYocYA71zix3l6NcUst24CVzj0"],
  [11, "Hombros, espalda y cuello", "brazos", "1yBPgUwfNJu6ousr17BIC9u4avroRAPZ3"],
  [12, "Core: abdomen, oblicuos y lumbar", "abdomen", "1wHJkqs5g9XwpQfNjU2TSf8t1TO2YxWuj"],
  [13, "Piernas y glúteos", "piernas", "1LOhD5kgEUsBDrHyDQew56JSxHCoF_6Kr"],
  [14, "Pilates de pie", "pie", "1V84ttJadMhg-dsAXRZCVdTkotX5pZnfT"],
  [15, "Estiramientos", "estiramiento", "1KwLYL_SEVTdwhAPnuphZ_9ka5Qq-mRpp"],
  [16, "Cuerpo entero", "cuerpo", "1gPshMN5hmXK5gvzx0ifxIS6gGwF50Ktj"],
  [17, "Hombros y espalda", "brazos", "1egAkNA9F-8c-L7ZUkyI99qbFoPDZ3K5D"],
  [18, "Coordinación de cuerpo entero", "cuerpo", "1IIzlyslXQTYe_qZ8QYajPUu23BnN4WEe"],
  [19, "Movilidad de articulaciones", "movilidad", "1AJ4aDLgwcEkl0HRctfiFOL2GWLYOUa75"],
  [20, "Core: abdomen, oblicuos y lumbar", "abdomen", "1rmOsLdaNzg9mG7fjSWZHiYOD_PD4Ngmj"],
  [21, "Pilates de pie", "pie", "1u_qTnerAIHf3YUiZ4ZyBrxIw-rr4jSZB"],
];

const RAPIDAS: Semilla[] = [
  [1, "Glúteos firmes", "piernas", "1LNhONAwIwgPeix7fw90GduGpNpt0Nmxk", "10 min"],
  [2, "Despertar flexible", "estiramiento", "197JR8a9bmCIVrb2gSrD-m3G_OaaSGV5f", "10 min"],
  [3, "Cintura y abdomen", "abdomen", "12aztLEdiXB0LGonthImutPbW7baBwESF", "10 min"],
  [4, "Espalda fuerte", "brazos", "1r85fawSeKaiIpQe7e0dxrG9gEH-AUA5Y", "10 min"],
  [5, "Sculpt intenso", "cuerpo", "14gSC3PTDsKbvkKvpC9h6GQjUfJxNcFcx", "10 min"],
  [6, "Cuerpo completo express", "cuerpo", "1P37zgogI3mMMSnPSr6mwoRM18fv6UHtH", "8 min"],
  [7, "Pilates de la mañana", "movilidad", "1bQfCAhUU06LikXqxQiw1IwuEci0oKvgG", "10 min"],
  [8, "Abdomen express", "abdomen", "1sak7GxWGvEnpTQmVPwNQP5tQO8WoALT8", "10 min"],
  [9, "Glúteos express", "piernas", "1p5Dnw7D5q5D0IDsLi_3-unmcPeGjtVA3", "12 min"],
];

export const NOMBRE_CATEGORIA: Record<Categoria, string> = {
  cuerpo: "Cuerpo entero",
  piernas: "Piernas y glúteos",
  abdomen: "Abdomen y core",
  movilidad: "Movilidad",
  brazos: "Brazos y espalda",
  pie: "Pilates de pie",
  estiramiento: "Estiramiento",
};

const id = (prefijo: string, n: number) => `${prefijo}-${String(n).padStart(2, "0")}`;

export const CLASES: Rutina[] = [
  ...DIAS.map(([orden, titulo, categoria, videoId, duracion]) => ({
    id: id("reto", orden),
    tipo: "reto" as const,
    orden,
    titulo,
    categoria,
    zona: NOMBRE_CATEGORIA[categoria],
    duracion: duracion ?? "",
    descripcion: "",
    videoUrl: drive(videoId),
  })),
  ...RAPIDAS.map(([orden, titulo, categoria, videoId, duracion]) => ({
    id: id("rapida", orden),
    tipo: "rapida" as const,
    orden,
    titulo,
    categoria,
    zona: NOMBRE_CATEGORIA[categoria],
    duracion: duracion ?? "",
    descripcion: "",
    videoUrl: drive(videoId),
  })),
];
