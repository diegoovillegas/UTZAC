import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Evento, Carrera, User } from '../../models/aspirante.model';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.page.html',
  styleUrls: ['./eventos.page.scss'],
  standalone: false
})
export class EventosPage implements OnInit {
  currentUser: User | null = null;
  eventos: Evento[] = [];
  carreras: Carrera[] = [];
  showEventoModal = false;
  isEditing = false;
  eventoEditando: Evento | null = null;

  eventoData = {
    nombre: '',
    fecha: '',
    carreras_promocionadas: [] as number[],
    maestro: '',
    vehiculos_disponibles: '',
    observaciones: '',
    participantes: ''
  };

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  async loadCurrentUser() {
    this.currentUser = await this.dataService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    await this.loadData();
  }

  async loadData() {
    this.carreras = await this.dataService.getCarreras();
    (await this.dataService.getEventos()).subscribe(eventos => {
      this.eventos = (eventos as any[]).sort((a, b) => 
  new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
);
    });
  }

  abrirModalEvento() {
    this.isEditing = false;
    this.eventoEditando = null;
    this.resetForm();
    this.showEventoModal = true;
  }

  editarEvento(evento: Evento) {
    this.isEditing = true;
    this.eventoEditando = evento;
    
    this.eventoData = {
      nombre: evento.nombre,
      fecha: evento.fecha.toISOString(),
      carreras_promocionadas: evento.carreras_promocionadas.map(c => c.id),
      maestro: evento.maestro || '',
      vehiculos_disponibles: evento.vehiculos_disponibles.join(', '),
      observaciones: evento.observaciones,
      participantes: evento.participantes.join(', ')
    };
    
    this.showEventoModal = true;
  }

  cerrarModalEvento() {
    this.showEventoModal = false;
    this.isEditing = false;
    this.eventoEditando = null;
    this.resetForm();
  }

  async guardarEvento() {
    if (this.isFormValid()) {
      
      const carrerasSeleccionadas = this.carreras.filter(c => 
        this.eventoData.carreras_promocionadas.includes(c.id)
      );
      
      const vehiculos = this.eventoData.vehiculos_disponibles 
        ? this.eventoData.vehiculos_disponibles.split(',').map((v: string) => v.trim()).filter((v: string) => v)
        : [];
      
      const participantes = this.eventoData.participantes 
        ? this.eventoData.participantes.split(',').map((p: string) => p.trim()).filter((p: string) => p)
        : [];

      const eventoData = {
        nombre: this.eventoData.nombre,
        fecha: new Date(this.eventoData.fecha),
        carreras_promocionadas: carrerasSeleccionadas,
        maestro: this.eventoData.maestro || undefined,
        vehiculos_disponibles: vehiculos,
        observaciones: this.eventoData.observaciones,
        participantes: participantes
      };

      if (this.isEditing && this.eventoEditando) {
        // Actualizar evento existente (simulado)
        Object.assign(this.eventoEditando, eventoData);
      } else {
        // Crear nuevo evento
        await this.dataService.crearEvento(eventoData);
      }
      
      this.cerrarModalEvento();
    }
  }

  isFormValid(): boolean {
    return !!(
      this.eventoData.nombre &&
      this.eventoData.fecha &&
      this.eventoData.carreras_promocionadas.length > 0
    );
  }

  resetForm() {
    this.eventoData = {
      nombre: '',
      fecha: '',
      carreras_promocionadas: [],
      maestro: '',
      vehiculos_disponibles: '',
      observaciones: '',
      participantes: ''
    };
  }

  async logout() {
    await this.dataService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}