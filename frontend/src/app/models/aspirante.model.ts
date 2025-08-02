export interface Bachillerato {
  id: number;
  nombre: string;
  municipio: Municipio;
}

export interface Municipio {
  id: number;
  nombre: string;
}

export interface Carrera {
  id: number;
  nombre: string;
}

export interface Campus {
  id: number;
  nombre: string;
}

export interface Enteraste {
  id: number;
  nombre: string;
}

export interface Semaforo {
  id: number;
  color: string;
  rgb: string;
  estado_nota: string;
  es_final: boolean;
}

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'responsable' | 'administrador';
}

export interface Toque {
  id: number;
  nombre: string;
  nota: string;
  fecha: Date;
  aspirante_id: number;
  responsable: User;
}

export interface PlantillaMensaje {
  id: number;
  mensaje: string;
  tipo: string;
  creado_por: User;
}

export interface Documento {
  id: number;
  nombre: string;
  archivo: string;
  aspirante_id: number;
}

export interface Evento {
  id: number;
  nombre: string;
  fecha: Date;
  carreras_promocionadas: Carrera[];
  maestro?: string;
  vehiculos_disponibles: string[];
  observaciones: string;
  participantes: string[];
}

export interface Aspirante {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  grado_escolar: string;
  comentarios: string;
  bachillerato_procedencia: Bachillerato;
  municipio_procedencia: Municipio;
  carrera_interes: Carrera;
  campus_interes: Campus;
  como_se_entero: Enteraste;
  responsable: User;
  toques: Toque[];
  estado_semaforo: Semaforo;
  documentos: Documento[];
  mensajes_enviados: PlantillaMensaje[];
  fecha_registro: Date;
}

export interface EstadisticasPanel {
  total_aspirantes: number;
  por_semaforo: { [key: string]: number };
  carreras_populares: { carrera: string; cantidad: number }[];
  municipios_origen: { municipio: string; cantidad: number }[];
  por_responsable: { responsable: string; cantidad: number }[];
  eventos_mes: number;
  conversion_rate: number;
}