// Textos y datos de la marca. Edita aquí sin tocar el resto del código.
export const MARCA = {
  nombre: "Reto Pilates 30D",
  marca: "Nuclea", // nombre de la app
  instructora: "Laura",
  eslogan: "Fuerza, equilibrio, mente y cuerpo.",
  foto: "/laura.jpg",
  avatar: "/laura-avatar.jpg",
  totalDias: 21, // clases del reto, se desbloquean en orden
  totalRapidas: 9, // siempre disponibles; cada una suma un día
  totalReto: 30, // 21 + 9
  // Número de WhatsApp de soporte/ventas, con código de país y sin "+" ni espacios.
  whatsapp: "570000000000",
};

export function linkWhatsapp(mensaje: string) {
  return `https://wa.me/${MARCA.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

// Notas de Laura en la pantalla de inicio: cambian cada día.
export const NOTAS_LAURA = [
  "Hoy no se trata de hacerlo perfecto, sino de aparecer.",
  "Respira profundo antes de empezar. Tu cuerpo ya sabe lo que tiene que hacer.",
  "Si hoy tienes poco tiempo, una rutina rápida también cuenta.",
  "Escucha a tu cuerpo: bajar la intensidad no es rendirse.",
  "Cada clase que terminas es una promesa que te cumples.",
  "Activa el abdomen, suelta los hombros y vamos.",
  "La constancia le gana a la intensidad. Nos vemos en el mat.",
  "Tu progreso no siempre se ve en la báscula. Fíjate en cómo te sientes.",
  "Hidrátate bien hoy. Tu cuerpo te lo va a agradecer en la clase.",
  "Hoy entrenas por la mujer que vas a ser al final del reto.",
];

export function notaDelDia() {
  const inicio = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dia = Math.floor((Date.now() - inicio) / 86400000);
  return NOTAS_LAURA[dia % NOTAS_LAURA.length];
}

export const ZONAS_MEDIDAS = ["Cintura", "Cadera", "Abdomen", "Brazo", "Pierna"];

export const ZONAS_DOLOR = [
  "Cuello",
  "Hombros",
  "Espalda alta",
  "Espalda baja",
  "Cadera",
  "Rodillas",
  "Muñecas",
  "Tobillos",
];

export const NIVELES_DOLOR = [
  { valor: 1, texto: "Leve" },
  { valor: 2, texto: "Moderado" },
  { valor: 3, texto: "Fuerte" },
];

export const ANIMOS = [
  { valor: 1, emoji: "😣", texto: "Muy mal" },
  { valor: 2, emoji: "😕", texto: "Regular" },
  { valor: 3, emoji: "😌", texto: "Bien" },
  { valor: 4, emoji: "😊", texto: "Muy bien" },
  { valor: 5, emoji: "🤩", texto: "¡Increíble!" },
];

export const AVISO_SALUD =
  "Las rutinas son de carácter general y no reemplazan la valoración de un profesional de la salud. Si tienes lesiones, dolor persistente, estás embarazada o tienes alguna condición médica, consulta a tu médico antes de empezar. Si sientes dolor fuerte durante un ejercicio, detente.";
