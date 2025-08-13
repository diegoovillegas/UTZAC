import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Bachillerato, Municipio, Carrera, Campus, Enteraste } from '../../models/aspirante.model';
import { SelectorMatcher } from '@angular/compiler';

@Component({
  selector: 'app-registro-publico',
  templateUrl: './registro-publico.page.html',
  styleUrls: ['./registro-publico.page.scss'],
  standalone: false
})
export class RegistroPublicoPage implements OnInit {
  aspiranteData = {
    nombre: '',
    email: '',
    telefono: '',
    grado_escolar: '',
    bachillerato_procedencia: '',
    municipio_procedencia: '',
    carrera_interes: [],
    campus_interes: [],
    como_se_entero: [],
    comentarios: '',
    medio_contacto: '',
  };

  isSubmitting = false;
  showSuccessModal = false;

  carreras: any[] = [];
  campusOptions: any[] = [];
  enterasteOpciones: any[] = [];

  constructor(private api: DataService) {}

  async ngOnInit() {
    await this.loadMasterData();
  }

  async loadMasterData() {
    try {
      this.carreras = await this.api.getCarreras();
      this.campusOptions = await this.api.getCampus();
      this.enterasteOpciones = await this.api.getEnteraste();
    } catch (error) {
      console.error('Error cargando datos maestros:', error);
    }
  }

  async onSubmit() {
    if (this.isFormValid()) {
      this.isSubmitting = true;
      
      try {
        await this.api.registrarAspirante(this.aspiranteData);
        
        this.showSuccessModal = true;
        this.resetForm();
        
      } catch (error) {
        console.error('Error al registrar aspirante:', error);
        // Aquí podrías mostrar un mensaje de error
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  isFormValid(): boolean {
    return !!(
      this.aspiranteData.nombre &&
      this.aspiranteData.email &&
      this.aspiranteData.telefono &&
      this.aspiranteData.grado_escolar &&
      this.aspiranteData.bachillerato_procedencia &&
      this.aspiranteData.municipio_procedencia &&
      this.aspiranteData.carrera_interes &&
      this.aspiranteData.campus_interes &&
      this.aspiranteData.como_se_entero
    );
  }

  resetForm() {
    this.aspiranteData = {
      nombre: '',
      email: '',
      telefono: '',
      grado_escolar: '',
      bachillerato_procedencia: '',
      municipio_procedencia: '',
      carrera_interes: [],
      campus_interes: [],
      como_se_entero: [],
      comentarios: '',
      medio_contacto: ''
    };
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}