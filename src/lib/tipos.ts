import type { Timestamp } from "firebase/firestore";

export type TipoRutina = "reto" | "rapida";

export type Categoria = "cuerpo" | "piernas" | "abdomen" | "movilidad" | "brazos" | "pie" | "estiramiento";

export interface Rutina {
  id: string; // "reto-01" ... "reto-21", "rapida-01" ... "rapida-10"
  tipo: TipoRutina;
  orden: number; // número de día o de rutina rápida
  titulo: string;
  duracion: string;
  zona: string;
  categoria?: Categoria;
  descripcion: string;
  videoUrl: string;
  pdfUrl?: string;
}

export interface PerfilUsuario {
  email: string;
  nombre: string;
  completados: Record<string, Timestamp | null>; // "1".."21" días del reto, "r1".."r9" rutinas rápidas
  diasActivos: string[]; // fechas AAAA-MM-DD con actividad (para la racha)
  objetivos: Objetivo[];
  motivo: string; // "¿Por qué empiezas este reto?"
}

export interface Objetivo {
  texto: string;
  logrado: boolean;
}

export interface UsuarioAdmin extends PerfilUsuario {
  uid: string;
  creado?: Timestamp | null;
}

export type TipoRegistro = "peso" | "medidas" | "animo" | "dolor" | "diario";

export interface Dolor {
  zona: string;
  nivel: number;
}

export interface Registro {
  id: string;
  tipo: TipoRegistro;
  fecha: Timestamp | null;
  peso?: number;
  medidas?: Record<string, number>;
  animo?: number;
  dolores?: Dolor[];
  nota?: string;
  texto?: string; // entrada del diario
  dia?: number;
}
