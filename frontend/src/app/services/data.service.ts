import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Storage } from '@ionic/storage-angular';
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
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class DataService {



  url = environment.urlapi
  private storage: Storage | null = null;
  
  private aspirantesSubject = new BehaviorSubject([]);
  private currentUserSubject = new BehaviorSubject(null);
  private eventosSubject = new BehaviorSubject([]);

  public aspirantes$ = this.aspirantesSubject;
  public currentUser$ = this.currentUserSubject;
  public eventos$ = this.eventosSubject;

  // Datos maestros simulados (después se reemplazarán por peticiones reales)
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

  private axiosInstance = axios.create({
    // configuración de axios
  });

  constructor(private ionicStorage: Storage) {
    this.initStorage();
    this.setupAxios();
    this.loadData();
  }

  private async initStorage() {
    this.storage = await this.ionicStorage.create();
    await this.loadUserFromStorage();
  }

  private setupAxios() {
    this.axiosInstance = axios.create({
      baseURL: this.url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Interceptor para agregar token automáticamente
    this.axiosInstance.interceptors.request.use(async (config) => {
      const token = await this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores de autenticación
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos de autenticación con Axios
  async login(data: any){
    
    const res = await axios.post(this.url + '/auth/local', data);
    const { jwt, user } = res.data;

    const userRes = await axios.get(this.url + '/users/me?populate[role]=true', {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    });

    return {
      token: jwt,
      user: userRes.data
    };
  }

  async logout(){
    await this.removeToken();
    await this.removeUser();
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async isLoggedIn(){
    const token = await this.getToken();
    return !!token;
  }

  // Métodos de storage para token y usuario
  private async setToken(token: string){
    if (this.storage) {
      await this.storage.set('auth_token', token);
    }
  }

  private async getToken(){
    if (this.storage) {
      return await this.storage.get('auth_token');
    }
    return null;
  }

  private async removeToken(){
    if (this.storage) {
      await this.storage.remove('auth_token');
    }
  }

  private async setUser(user: User){
    if (this.storage) {
      await this.storage.set('current_user', JSON.stringify(user));
    }
  }

  private async getUserFromStorage(){
    if (this.storage) {
      const userData = await this.storage.get('current_user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  private async removeUser(){
    if (this.storage) {
      await this.storage.remove('current_user');
    }
  }

  private async loadUserFromStorage(){
    const user = await this.getUserFromStorage();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  // Métodos para obtener datos maestros con Axios
  async getBachilleratos(){
    try {
      const response: AxiosResponse = await this.axiosInstance.get('/bachilleratos?populate=municipio');
      return response.data.data.map((item: any) => ({
        id: item.id,
        nombre: item.attributes.nombre,
        municipio: {
          id: item.attributes.municipio.data.id,
          nombre: item.attributes.municipio.data.attributes.nombre
        }
      }));
    } catch (error) {
      console.error('Error obteniendo bachilleratos:', error);
      return this.bachilleratos; // Datos simulados
    }
  }

  async getMunicipios(){
    try {
      const response: AxiosResponse = await this.axiosInstance.get('/municipios');
      return response.data.data.map((item: any) => ({
        id: item.id,
        nombre: item.attributes.nombre
      }));
    } catch (error) {
      console.error('Error obteniendo municipios:', error);
      return this.municipios; // Datos simulados
    }
  }

  async getCarreras(){
    try {
      const response = await axios.get(this.url + '/carreras?pagination[pageSize]=50');
      return response.data.data
    } catch (error) {
      console.error('Error obteniendo carreras:', error);
      return this.carreras; // Datos simulados
    }
  }

  async getCampus(){
    try {
      const response= await axios.get(this.url + '/campuses');
      return response.data.data
    } catch (error) {
      console.error('Error obteniendo campus:', error);
      return this.campus; // Datos simulados
    }
  }

  async getEnteraste(){
    try {
      const response = await axios.get(this.url + '/enterastes');
      return response.data.data
    } catch (error) {
      console.error('Error obteniendo enteraste:', error);
      return this.enteraste; // Datos simulados
    }
  }

  async getSemaforos(){
    try {
      const response = await axios.get(this.url + '/semaforos');
      return response.data.data
    } catch (error) {
      console.error('Error obteniendo semáforos:', error);
      return this.semaforos; // Datos simulados
    }
  }

  async getUsuarios(){
    try {
      const response = await axios.get(this.url + '/users?filters[role][name][$eq]=Responsable');
      return response.data.map((item: any) => ({
        id: item.documentId,
        nombre: item.username,
        email: item.email,
        role: item.role?.name
      }));
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return this.usuarios.filter((u:any) => u.role === 'responsable'); // Datos simulados
    }
  }

  getPlantillasMensajes(): PlantillaMensaje[] {
    return this.plantillasMensajes;
  }

  // Métodos para aspirantes con Axios
  async registrarAspirante(aspiranteData: any){
    console.log(aspiranteData)
    try {
      const responsableAsignado = await this.asignarResponsableEquitativo();
      const semaforo = "dtpkc60ytzmvwgxmb1133f5m";
      const data = {
          nombre: aspiranteData.nombre,
          email: aspiranteData.email,
          telefono: aspiranteData.telefono,
          grado_escolar: aspiranteData.grado_escolar,
          comentarios: aspiranteData.comentarios,
          bachillerato_procedencia: aspiranteData.bachillerato_procedencia,
          municipio_procedencia: aspiranteData.municipio_procedencia,
          carrera_interes: aspiranteData.carrera_interes,
          campus_interes: aspiranteData.campus_interes,
          como_se_entero: aspiranteData.como_se_entero,
          responsable: responsableAsignado.documentId,
          semaforo: semaforo,
          user: responsableAsignado.id

      };
      console.log('estos son los datos del aspirante',data)

      await axios.post(this.url + '/aspirantes', {data});
    } catch (error) {
      console.error('Error registrando aspirante:', error);
    }
  }

  async getAspirantes(){
     try {
      const response = await axios.get(this.url + '/aspirantes?populate=*');
      return response.data.data
    } catch (error) {
      console.error('Error cargando aspirantes:', error);
      // Cargar datos simulados
    }
  }



  async actualizarEstadoSemaforo(aspiranteId: number, semaforoId: number){
    try {
      await this.axiosInstance.put(`/aspirantes/${aspiranteId}`, {
        data: {
          estado_semaforo: semaforoId
        }
      });
      await this.getAspirantes; // Recargar lista
    } catch (error) {
      console.error('Error actualizando estado semáforo:', error);
      
      // Simulación para desarrollo
      const aspirantes = this.aspirantesSubject.value;
      const aspirante = aspirantes.find((a:any) => a.id === aspiranteId);
      if (aspirante) {
        const semaforo = this.semaforos.find(s => s.id === semaforoId);
        if (semaforo) {
          // aspirante.estado_semaforo = semaforo;
          this.aspirantesSubject.next(aspirantes);
        }
      }
    }
  }  

  async agregarToque(aspiranteId: number, toque: Omit<Toque, 'id' | 'aspirante_id'>){
    try {
      await this.axiosInstance.post('/toques', {
        data: {
          nombre: toque.nombre,
          nota: toque.nota,
          fecha: toque.fecha.toISOString(),
          aspirante: aspiranteId,
          responsable: toque.responsable.id
        }
      });
      await this.getAspirantes();
    } catch (error) {
      console.error('Error agregando toque:', error);
      
      // Simulación para desarrollo
      const aspirantes = this.aspirantesSubject.value;
      const aspirante = aspirantes.find((a:any) => a.id === aspiranteId);
      if (aspirante) {
        const nuevoToque: Toque = {
          id: Date.now(),
          aspirante_id: aspiranteId,
          ...toque
        };
        // aspirante.toques.push(nuevoToque);
        this.aspirantesSubject.next(aspirantes);
        this.saveData();
      }
    }
  }

  async transferirAspirantes(responsableOrigenId: number, responsableDestinoId: number){
    try {
      // En Strapi sería una operación más compleja, posiblemente con un endpoint personalizado
      await this.axiosInstance.post('/aspirantes/transferir', {
        responsable_origen: responsableOrigenId,
        responsable_destino: responsableDestinoId
      });
      await this.getAspirantes(); // Recargar lista
    } catch (error) {
      console.error('Error transfiriendo aspirantes:', error);
      
      // Simulación para desarrollo
      const aspirantes = this.aspirantesSubject.value;
      const responsableDestino = this.usuarios.find(u => u.id === responsableDestinoId);
      
      if (responsableDestino) {
        aspirantes.forEach((aspirante:any) => {
          if (aspirante.responsable.id === responsableOrigenId) {
            aspirante.responsable = responsableDestino;
            aspirante.toques.forEach((toque:any) => {
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
  }

  // Métodos para eventos con Axios
  async crearEvento(evento: Omit<Evento, 'id'>){
    try {
      await this.axiosInstance.post('/eventos', {
        data: {
          nombre: evento.nombre,
          fecha: evento.fecha.toISOString(),
          carreras_promocionadas: evento.carreras_promocionadas.map(c => c.id),
          maestro: evento.maestro,
          vehiculos_disponibles: evento.vehiculos_disponibles,
          observaciones: evento.observaciones,
          participantes: evento.participantes
        }
      });
      await this.loadEventos(); // Recargar lista
    } catch (error) {
      console.error('Error creando evento:', error);
      
      // Simulación para desarrollo
      const eventos = this.eventosSubject.value;
      const nuevoEvento: Evento = {
        id: Date.now(),
        ...evento
      };
      this.eventosSubject.next(eventos);
      this.saveEventos();
    }
  }

  async getEventos(){
    await this.loadEventos();
    return this.eventos$;
  }

  private async loadEventos(){
    try {
      const response: AxiosResponse = await this.axiosInstance.get('/eventos?populate=carreras_promocionadas');
      const eventos = response.data.data.map((item: any) => ({
        id: item.id,
        nombre: item.attributes.nombre,
        fecha: new Date(item.attributes.fecha),
        carreras_promocionadas: item.attributes.carreras_promocionadas.data.map((carrera: any) => ({
          id: carrera.id,
          nombre: carrera.attributes.nombre
        })),
        maestro: item.attributes.maestro,
        vehiculos_disponibles: item.attributes.vehiculos_disponibles || [],
        observaciones: item.attributes.observaciones,
        participantes: item.attributes.participantes || []
      }));
      
      this.eventosSubject.next(eventos);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      // Cargar datos simulados
      this.loadEventosFromStorage();
    }
  }

  // Métodos para estadísticas
  async getEstadisticas(){
    try {
      const response: AxiosResponse = await this.axiosInstance.get('/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      
      // Simulación para desarrollo
      const aspirantes = this.aspirantesSubject.value;
      const eventos = this.eventosSubject.value;
      
      const porSemaforo: { [key: string]: number } = {};
      this.semaforos.forEach(s => {
        porSemaforo[s.color] = aspirantes.filter((a:any) => a.estado_semaforo.id === s.id).length;
      });

      const carrerasCount: { [key: string]: number } = {};
      aspirantes.forEach((a:any) => {
        const carrera = a.carrera_interes.nombre;
        carrerasCount[carrera] = (carrerasCount[carrera] || 0) + 1;
      });
      const carrerasPopulares = Object.entries(carrerasCount)
        .map(([carrera, cantidad]) => ({ carrera, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      const municipiosCount: { [key: string]: number } = {};
      aspirantes.forEach((a:any) => {
        const municipio = a.municipio_procedencia.nombre;
        municipiosCount[municipio] = (municipiosCount[municipio] || 0) + 1;
      });
      const municipiosOrigen = Object.entries(municipiosCount)
        .map(([municipio, cantidad]) => ({ municipio, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5);

      const responsableCount: { [key: string]: number } = {};
      aspirantes.forEach((a:any) => {
        const responsable = a.responsable.nombre;
        responsableCount[responsable] = (responsableCount[responsable] || 0) + 1;
      });
      const porResponsable = Object.entries(responsableCount)
        .map(([responsable, cantidad]) => ({ responsable, cantidad }));

      const inicioMes = new Date();
      inicioMes.setDate(1);
      const eventosMes = eventos.filter((e: any) => e.fecha >= inicioMes).length;

      const inscritos = aspirantes.filter((a: any) => a.estado_semaforo.color === 'Verde').length;
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
  }

  // Métodos privados auxiliares
  private async asignarResponsableEquitativo(){
    const responsables = await this.getUsuarios();
    const aspirantes = this.aspirantesSubject.value;
    
    const conteos = responsables.map((r:any) => ({
      responsable: r,
      cantidad: aspirantes.filter((a: any) => a.responsable?.documentId === r.documentId).length
    }));
    console.log('este es el conteo', conteos)
    
   conteos.sort((a: any, b: any) => a.cantidad - b.cantidad);
    return conteos[0].responsable;
  }

  // Métodos de respaldo para datos simulados (remover en producción)
  private loadData(): void {
    this.loadDataFromStorage();
    this.loadEventosFromStorage();
  }

  private loadDataFromStorage(): void {
    const savedAspirantes = localStorage.getItem('aspirantes');
    if (savedAspirantes) {
      const aspirantes = JSON.parse(savedAspirantes);
      aspirantes.forEach((a: any) => {
        a.fecha_registro = new Date(a.fecha_registro);
        a.toques.forEach((t: any) => t.fecha = new Date(t.fecha));
      });
      this.aspirantesSubject.next(aspirantes);
    }
  }

  private loadEventosFromStorage(): void {
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