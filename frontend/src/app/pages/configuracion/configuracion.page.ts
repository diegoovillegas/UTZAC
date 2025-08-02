import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  plantillaForm: FormGroup;
  isEditing = false;
  plantillaEditando: PlantillaMensaje | null = null;
  currentDate = new Date();

  constructor(
    private dataService: DataService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.plantillaForm = this.formBuilder.group({
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
      tipo: ['', Validators.required]
    });
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
    this.plantillaForm.reset();
    this.showPlantillaModal = true;
  }

  editarPlantilla(plantilla: PlantillaMensaje) {
    this.isEditing = true;
    this.plantillaEditando = plantilla;
    
    this.plantillaForm.patchValue({
      mensaje: plantilla.mensaje,
      tipo: plantilla.tipo
    });
    
    this.showPlantillaModal = true;
  }

  cerrarModalPlantilla() {
    this.showPlantillaModal = false;
    this.isEditing = false;
    this.plantillaEditando = null;
    this.plantillaForm.reset();
  }

  guardarPlantilla() {
    if (this.plantillaForm.valid && this.currentUser) {
      const formData = this.plantillaForm.value;
      
      if (this.isEditing && this.plantillaEditando) {
        // Actualizar plantilla existente (simulado)
        this.plantillaEditando.mensaje = formData.mensaje;
        this.plantillaEditando.tipo = formData.tipo;
      } else {
        // Crear nueva plantilla
        const nuevaPlantilla: PlantillaMensaje = {
          id: Date.now(),
          mensaje: formData.mensaje,
          tipo: formData.tipo,
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.plantillaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
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