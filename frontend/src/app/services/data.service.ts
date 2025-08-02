import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  Aspirante, 
  Bachillerato, 
  Municipio, 
  Carrera, 
  Campus, 
  Enteraste, 
  Semaforo, 
  User, 
  Toque, 
  PlantillaMensaje, 
  Documento, 
  Evento,
  EstadisticasPanel 
} from '../models/aspirante.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private aspirantesSubject = new BehaviorSubject<Aspirante[]>([]);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private eventosSubject = new BehaviorSubject<Evento[]>([]);

  public aspirantes$ = this.aspirantesSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();
  public eventos$ = this.eventosSubject.asObservable();

  // Datos maestros
  private bachilleratos: Bachillerato[] = [
    { id: 1, nombre: 'CBTis 226', municipio: { id: 1, nombre: 'Río Grande' } },
    { id: 2, nombre: 'COBAEZ 01', municipio: { id: 2, nombre: 'Zacatecas' } },
    { id: 3, nombre: 'Preparatoria UTZAC', municipio: { id: 3, nombre: 'Sombrerete' } }
  ];

  private municipios: Municipio[] = [
    { id: 1, nombre: 'Río Grande' },
    { id: 2, nombre: 'Zacatecas' },
    { id: 3, nombre: 'Sombrerete' },
    { id: 4, nombre: 'Fresnillo' },
    { id: 5, nombre: 'Jerez' }
  ];

  private carreras: Carrera[] = [
    { id: 1, nombre: 'Ingeniería en Sistemas Computacionales' },
    { id: 2, nombre: 'Ingeniería Industrial' },
    { id: 3, nombre: 'Ingeniería en Energías Renovables' },
    { id: 4, nombre: 'Licenciatura en Administración' },
    { id: 5, nombre: 'Técnico Superior en Mecatrónica' }
  ];

  private campus: Campus[] = [
    { id: 1, nombre: 'Campus Principal - Río Grande' },
    { id: 2, nombre: 'Campus Sombrerete' }
  ];

  private enteraste: Enteraste[] = [
    { id: 1, nombre: 'Redes sociales' },
    { id: 2, nombre: 'Amigos/Familiares' },
    { id: 3, nombre: 'Feria educativa' },
    { id: 4, nombre: 'Visita a bachillerato' },
    { id: 5, nombre: 'Página web' }
  ];

  private semaforos: Semaforo[] = [
    { id: 1, color: 'Rojo', rgb: '#ef4444', estado_nota: 'No contestó', es_final: false },
    { id: 2, color: 'Amarillo', rgb: '#eab308', estado_nota: 'Interesado', es_final: false },
    { id: 3, color: 'Rosa', rgb: '#ec4899', estado_nota: 'Interesado para otro ciclo', es_final: true },
    { id: 4, color: 'Verde', rgb: '#22c55e', estado_nota: 'Inscrito', es_final: true }
  ];

  private usuarios: User[] = [
    { id: 1, nombre: 'María González', email: 'maria@utzac.edu.mx', rol: 'administrador' },
    { id: 2, nombre: 'Juan Pérez', email: 'juan@utzac.edu.mx', rol: 'responsable' },
    { id: 3, nombre: 'Ana López', email: 'ana@utzac.edu.mx', rol: 'responsable' },
    { id: 4, nombre: 'Carlos Martínez', email: 'carlos@utzac.edu.mx', rol: 'responsable' }
  ];

  private plantillasMensajes: PlantillaMensaje[] = [
    {
      id: 1,
      mensaje: '¡Hola {nombre}! Gracias por tu interés en UTZAC. Te contactaremos pronto para brindarte más información.',
      tipo: 'Bienvenida',
      creado_por: this.usuarios[0]
    },
    {
      id: 2,
      mensaje: 'Hola {nombre}, te recordamos que las inscripciones para {carrera} están abiertas. ¡No pierdas esta oportunidad!',
      tipo: 'Promoción',
      creado_por: this.usuarios[0]
    }
  ];

  constructor() {
    this.loadData();
  }

  // Métodos de autenticación
  login(email: string, password: string): boolean {
    const user = this.usuarios.find(u => u.email === email);
    if (user && password === '123456') { // Password demo
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // Métodos para obtener datos maestros
  getBachilleratos(): Bachillerato[] {
    return this.bachilleratos;
  }

  getMunicipios(): Municipio[] {
    return this.municipios;
  }

  getCarreras(): Carrera[] {
    return this.carreras;
  }

  getCampus(): Campus[] {
    return this.campus;
  }

  getEnteraste(): Enteraste[] {
    return this.enteraste;
  }

  getSemaforos(): Semaforo[] {
    return this.semaforos;
  }

  getUsuarios(): User[] {
    return this.usuarios.filter(u => u.rol === 'responsable');
  }

  getPlantillasMensajes(): PlantillaMensaje[] {
    return this.plantillasMensajes;
  }

  // Métodos para aspirantes
  registrarAspirante(aspiranteData: any): void {
    const aspirantes = this.aspirantesSubject.value;
    const responsableAsignado = this.asignarResponsableEquitativo();
    
    const nuevoAspirante: Aspirante = {
      id: Date.now(),
      ...aspiranteData,
      responsable: responsableAsignado,
      toques: [],
      estado_semaforo: this.semaforos[0], // Rojo por defecto
      documentos: [],
      mensajes_enviados: [],
      fecha_registro: new Date()
    };

    aspirantes.push(nuevoAspirante);
    this.aspirantesSubject.next(aspirantes);
    this.saveData();
  }

  getAspirantes(): Observable<Aspirante[]> {
    return this.aspirantes$;
  }

  getAspirantesPorResponsable(responsableId: number): Aspirante[] {
    return this.aspirantesSubject.value.filter(a => a.responsable.id === responsableId);
  }

  actualizarEstadoSemaforo(aspiranteId: number, semaforoId: number): void {
    const aspirantes = this.aspirantesSubject.value;
    const aspirante = aspirantes.find(a => a.id === aspiranteId);
    if (aspirante) {
      const semaforo = this.semaforos.find(s => s.id === semaforoId);
      if (semaforo) {
        aspirante.estado_semaforo = semaforo;
        this.aspirantesSubject.next(aspirantes);
        this.saveData();
      }
    }
  }

  agregarToque(aspiranteId: number, toque: Omit<Toque, 'id' | 'aspirante_id'>): void {
    const aspirantes = this.aspirantesSubject.value;
    const aspirante = aspirantes.find(a => a.id === aspiranteId);
    if (aspirante) {
      const nuevoToque: Toque = {
        id: Date.now(),
        aspirante_id: aspiranteId,
        ...toque
      };
      aspirante.toques.push(nuevoToque);
      this.aspirantesSubject.next(aspirantes);
      this.saveData();
    }
  }

  transferirAspirantes(responsableOrigenId: number, responsableDestinoId: number): void {
    const aspirantes = this.aspirantesSubject.value;
    const responsableDestino = this.usuarios.find(u => u.id === responsableDestinoId);
    
    if (responsableDestino) {
      aspirantes.forEach(aspirante => {
        if (aspirante.responsable.id === responsableOrigenId) {
          aspirante.responsable = responsableDestino;
          // También transferir toques
          aspirante.toques.forEach(toque => {
            if (toque.responsable.id === responsableOrigenId) {
              toque.responsable = responsableDestino;
            }
          });
        }
      });
      
      this.aspirantesSubject.next(aspirantes);
      this.saveData();
    }
  }

  // Métodos para eventos
  crearEvento(evento: Omit<Evento, 'id'>): void {
    const eventos = this.eventosSubject.value;
    const nuevoEvento: Evento = {
      id: Date.now(),
      ...evento
    };
    eventos.push(nuevoEvento);
    this.eventosSubject.next(eventos);
    this.saveEventos();
  }

  getEventos(): Observable<Evento[]> {
    return this.eventos$;
  }

  // Métodos para estadísticas
  getEstadisticas(): EstadisticasPanel {
    const aspirantes = this.aspirantesSubject.value;
    const eventos = this.eventosSubject.value;
    
    // Estadísticas por semáforo
    const porSemaforo: { [key: string]: number } = {};
    this.semaforos.forEach(s => {
      porSemaforo[s.color] = aspirantes.filter(a => a.estado_semaforo.id === s.id).length;
    });

    // Carreras más populares
    const carrerasCount: { [key: string]: number } = {};
    aspirantes.forEach(a => {
      const carrera = a.carrera_interes.nombre;
      carrerasCount[carrera] = (carrerasCount[carrera] || 0) + 1;
    });
    const carrerasPopulares = Object.entries(carrerasCount)
      .map(([carrera, cantidad]) => ({ carrera, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // Municipios de origen
    const municipiosCount: { [key: string]: number } = {};
    aspirantes.forEach(a => {
      const municipio = a.municipio_procedencia.nombre;
      municipiosCount[municipio] = (municipiosCount[municipio] || 0) + 1;
    });
    const municipiosOrigen = Object.entries(municipiosCount)
      .map(([municipio, cantidad]) => ({ municipio, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);

    // Por responsable
    const responsableCount: { [key: string]: number } = {};
    aspirantes.forEach(a => {
      const responsable = a.responsable.nombre;
      responsableCount[responsable] = (responsableCount[responsable] || 0) + 1;
    });
    const porResponsable = Object.entries(responsableCount)
      .map(([responsable, cantidad]) => ({ responsable, cantidad }));

    // Eventos del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    const eventosMes = eventos.filter(e => e.fecha >= inicioMes).length;

    // Tasa de conversión (inscritos / total)
    const inscritos = aspirantes.filter(a => a.estado_semaforo.color === 'Verde').length;
    const conversionRate = aspirantes.length > 0 ? (inscritos / aspirantes.length) * 100 : 0;

    return {
      total_aspirantes: aspirantes.length,
      por_semaforo: porSemaforo,
      carreras_populares: carrerasPopulares,
      municipios_origen: municipiosOrigen,
      por_responsable: porResponsable,
      eventos_mes: eventosMes,
      conversion_rate: Math.round(conversionRate * 100) / 100
    };
  }

  // Métodos privados
  private asignarResponsableEquitativo(): User {
    const responsables = this.usuarios.filter(u => u.rol === 'responsable');
    const aspirantes = this.aspirantesSubject.value;
    
    // Contar aspirantes por responsable
    const conteos = responsables.map(r => ({
      responsable: r,
      cantidad: aspirantes.filter(a => a.responsable.id === r.id).length
    }));
    
    // Ordenar por menor cantidad y devolver el primero
    conteos.sort((a, b) => a.cantidad - b.cantidad);
    return conteos[0].responsable;
  }

  private loadData(): void {
    // Cargar usuario actual
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }

    // Cargar aspirantes
    const savedAspirantes = localStorage.getItem('aspirantes');
    if (savedAspirantes) {
      const aspirantes = JSON.parse(savedAspirantes);
      // Convertir fechas de string a Date
      aspirantes.forEach((a: any) => {
        a.fecha_registro = new Date(a.fecha_registro);
        a.toques.forEach((t: any) => t.fecha = new Date(t.fecha));
      });
      this.aspirantesSubject.next(aspirantes);
    }

    // Cargar eventos
    const savedEventos = localStorage.getItem('eventos');
    if (savedEventos) {
      const eventos = JSON.parse(savedEventos);
      eventos.forEach((e: any) => e.fecha = new Date(e.fecha));
      this.eventosSubject.next(eventos);
    }
  }

  private saveData(): void {
    localStorage.setItem('aspirantes', JSON.stringify(this.aspirantesSubject.value));
  }

  private saveEventos(): void {
    localStorage.setItem('eventos', JSON.stringify(this.eventosSubject.value));
  }
}