import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  eventoForm: FormGroup;
  isEditing = false;
  eventoEditando: Evento | null = null;

  constructor(
    private dataService: DataService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.eventoForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      fecha: ['', Validators.required],
      carreras_promocionadas: [[], Validators.required],
      maestro: [''],
      vehiculos_disponibles: [''],
      observaciones: [''],
      participantes: ['']
    });
  }

  ngOnInit() {
    this.currentUser = this.dataService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadData();
  }

  loadData() {
    this.carreras = this.dataService.getCarreras();
    this.dataService.getEventos().subscribe(eventos => {
      this.eventos = eventos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    });
  }

  abrirModalEvento() {
    this.isEditing = false;
    this.eventoEditando = null;
    this.eventoForm.reset();
    this.showEventoModal = true;
  }

  editarEvento(evento: Evento) {
    this.isEditing = true;
    this.eventoEditando = evento;
    
    this.eventoForm.patchValue({
      nombre: evento.nombre,
      fecha: evento.fecha.toISOString(),
      carreras_promocionadas: evento.carreras_promocionadas.map(c => c.id),
      maestro: evento.maestro || '',
      vehiculos_disponibles: evento.vehiculos_disponibles.join(', '),
      observaciones: evento.observaciones,
      participantes: evento.participantes.join(', ')
    });
    
    this.showEventoModal = true;
  }

  cerrarModalEvento() {
    this.showEventoModal = false;
    this.isEditing = false;
    this.eventoEditando = null;
    this.eventoForm.reset();
  }

  guardarEvento() {
    if (this.eventoForm.valid) {
      const formData = this.eventoForm.value;
      
      const carrerasSeleccionadas = this.carreras.filter(c => 
        formData.carreras_promocionadas.includes(c.id)
      );
      
      const vehiculos = formData.vehiculos_disponibles 
        ? formData.vehiculos_disponibles.split(',').map((v: string) => v.trim()).filter((v: string) => v)
        : [];
      
      const participantes = formData.participantes 
        ? formData.participantes.split(',').map((p: string) => p.trim()).filter((p: string) => p)
        : [];

      const eventoData = {
        nombre: formData.nombre,
        fecha: new Date(formData.fecha),
        carreras_promocionadas: carrerasSeleccionadas,
        maestro: formData.maestro || undefined,
        vehiculos_disponibles: vehiculos,
        observaciones: formData.observaciones,
        participantes: participantes
      };

      if (this.isEditing && this.eventoEditando) {
        // Actualizar evento existente (simulado)
        Object.assign(this.eventoEditando, eventoData);
      } else {
        // Crear nuevo evento
        this.dataService.crearEvento(eventoData);
      }
      
      this.cerrarModalEvento();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  logout() {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}