import type { Timestamp } from "firebase/firestore";

export type TipoRutina = "reto" | "rapida";

export interface Rutina {
  id: string; // "reto-01" ... "reto-21", "rapida-01" ... "rapida-10"
  tipo: TipoRutina;
  orden: number; // número de día o de rutina rápida
  titulo: string;
  duracion: string;
  zona: string;
  descripcion: string;
  videoUrl: string;
  pdfUrl?: string;
}

export interface Acceso {
  email: string;
  nombre?: string;
  whatsapp?: string;
  pais?: string;
  activo: boolean;
  creado?: Timestamp | null;
}

export interface PerfilUsuario {
  email: string;
  nombre: string;
  completados: Record<string, Timestamp | null>; // clave = número de día
  diasActivos: string[]; // fechas AAAA-MM-DD con actividad (para la racha)
}

export type TipoRegistro = "peso" | "medidas" | "animo" | "dolor";

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
  dia?: number;
}
