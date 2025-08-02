import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Bachillerato, Municipio, Carrera, Campus, Enteraste } from '../../models/aspirante.model';

@Component({
  selector: 'app-registro-publico',
  templateUrl: './registro-publico.page.html',
  styleUrls: ['./registro-publico.page.scss'],
  standalone: false
})
export class RegistroPublicoPage implements OnInit {
  aspiranteForm: FormGroup;
  isSubmitting = false;
  showSuccessModal = false;

  bachilleratos: Bachillerato[] = [];
  municipios: Municipio[] = [];
  carreras: Carrera[] = [];
  campusOptions: Campus[] = [];
  enterasteOpciones: Enteraste[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService
  ) {
    this.aspiranteForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.minLength(10)]],
      grado_escolar: ['', Validators.required],
      bachillerato_procedencia: ['', Validators.required],
      municipio_procedencia: ['', Validators.required],
      carrera_interes: ['', Validators.required],
      campus_interes: ['', Validators.required],
      como_se_entero: ['', Validators.required],
      comentarios: ['']
    });
  }

  ngOnInit() {
    this.loadMasterData();
  }

  loadMasterData() {
    this.bachilleratos = this.dataService.getBachilleratos();
    this.municipios = this.dataService.getMunicipios();
    this.carreras = this.dataService.getCarreras();
    this.campusOptions = this.dataService.getCampus();
    this.enterasteOpciones = this.dataService.getEnteraste();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.aspiranteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit() {
    if (this.aspiranteForm.valid) {
      this.isSubmitting = true;
      
      try {
        // Simular delay de envío
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.dataService.registrarAspirante(this.aspiranteForm.value);
        
        this.showSuccessModal = true;
        this.aspiranteForm.reset();
        
      } catch (error) {
        console.error('Error al registrar aspirante:', error);
        // Aquí podrías mostrar un mensaje de error
      } finally {
        this.isSubmitting = false;
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.aspiranteForm.controls).forEach(key => {
        this.aspiranteForm.get(key)?.markAsTouched();
      });
    }
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}