import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { User, PlantillaMensaje } from '../../models/aspirante.model';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: false
})
export class ConfiguracionPage implements OnInit {
  currentUser: User | null = null;
  plantillas: PlantillaMensaje[] = [];
  showPlantillaModal = false;
  isEditing = false;
  plantillaEditando: PlantillaMensaje | null = null;
  
  plantillaData = {
    mensaje: '',
    tipo: ''
  };

  lastSessionDate = new Date().toLocaleString('es-MX');

  constructor(
    private dataService: DataService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.currentUser = this.dataService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Solo administradores pueden acceder a configuración
    if (this.currentUser.rol !== 'administrador') {
      this.router.navigate(['/dashboard']);
      return;
    }
    
    this.loadData();
  }

  loadData() {
    this.plantillas = this.dataService.getPlantillasMensajes();
  }

  abrirModalPlantilla() {
    this.isEditing = false;
    this.plantillaEditando = null;
    this.plantillaData = { mensaje: '', tipo: '' };
    this.showPlantillaModal = true;
  }

  editarPlantilla(plantilla: PlantillaMensaje) {
    this.isEditing = true;
    this.plantillaEditando = plantilla;
    
    this.plantillaData = {
      mensaje: plantilla.mensaje,
      tipo: plantilla.tipo
    };
    
    this.showPlantillaModal = true;
  }

  cerrarModalPlantilla() {
    this.showPlantillaModal = false;
    this.isEditing = false;
    this.plantillaEditando = null;
    this.plantillaData = { mensaje: '', tipo: '' };
  }

  guardarPlantilla() {
    if (this.isPlantillaFormValid() && this.currentUser) {
      
      if (this.isEditing && this.plantillaEditando) {
        // Actualizar plantilla existente (simulado)
        this.plantillaEditando.mensaje = this.plantillaData.mensaje;
        this.plantillaEditando.tipo = this.plantillaData.tipo;
      } else {
        // Crear nueva plantilla
        const nuevaPlantilla: PlantillaMensaje = {
          id: Date.now(),
          mensaje: this.plantillaData.mensaje,
          tipo: this.plantillaData.tipo,
          creado_por: this.currentUser
        };
        this.plantillas.push(nuevaPlantilla);
      }
      
      this.cerrarModalPlantilla();
    }
  }

  eliminarPlantilla(plantilla: PlantillaMensaje) {
    const index = this.plantillas.findIndex(p => p.id === plantilla.id);
    if (index > -1) {
      this.plantillas.splice(index, 1);
    }
  }

  isPlantillaFormValid(): boolean {
    return !!(this.plantillaData.mensaje && this.plantillaData.mensaje.length >= 10 && this.plantillaData.tipo);
  }

  limpiarDatos() {
    if (confirm('¿Estás seguro de que deseas limpiar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      alert('Datos limpiados exitosamente. La página se recargará.');
      window.location.reload();
    }
  }

  exportarDatos() {
    const datos = {
      aspirantes: JSON.parse(localStorage.getItem('aspirantes') || '[]'),
      eventos: JSON.parse(localStorage.getItem('eventos') || '[]'),
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `utzac-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  logout() {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}