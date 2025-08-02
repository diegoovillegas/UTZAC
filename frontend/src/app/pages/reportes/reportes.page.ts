import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { User, EstadisticasPanel, Aspirante } from '../../models/aspirante.model';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: false
})
export class ReportesPage implements OnInit {
  currentUser: User | null = null;
  estadisticas: EstadisticasPanel | null = null;
  aspirantes: Aspirante[] = [];
  
  // Filtros para reportes
  filtroFechaInicio: string = '';
  filtroFechaFin: string = '';
  filtroResponsable: number | null = null;
  filtroCarrera: number | null = null;
  
  responsables: User[] = [];
  carreras: any[] = [];

  constructor(
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.dataService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadData();
    this.setDefaultDates();
  }

  loadData() {
    this.estadisticas = this.dataService.getEstadisticas();
    this.responsables = this.dataService.getUsuarios();
    this.carreras = this.dataService.getCarreras();
    
    this.dataService.getAspirantes().subscribe(aspirantes => {
      this.aspirantes = aspirantes;
    });
  }

  setDefaultDates() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    this.filtroFechaInicio = inicioMes.toISOString().split('T')[0];
    this.filtroFechaFin = hoy.toISOString().split('T')[0];
  }

  aplicarFiltros() {
    // Aquí se aplicarían los filtros para generar reportes específicos
    console.log('Aplicando filtros:', {
      fechaInicio: this.filtroFechaInicio,
      fechaFin: this.filtroFechaFin,
      responsable: this.filtroResponsable,
      carrera: this.filtroCarrera
    });
  }

  exportarReporte(tipo: 'excel' | 'pdf') {
    // Simulación de exportación
    console.log(`Exportando reporte en formato ${tipo}`);
    
    // Aquí se implementaría la lógica real de exportación
    const mensaje = `Reporte ${tipo.toUpperCase()} generado exitosamente`;
    
    // Mostrar mensaje de confirmación (en una implementación real usarías un toast)
    alert(mensaje);
  }

  getAspirantesPorPeriodo() {
    if (!this.filtroFechaInicio || !this.filtroFechaFin) return this.aspirantes;
    
    const fechaInicio = new Date(this.filtroFechaInicio);
    const fechaFin = new Date(this.filtroFechaFin);
    
    return this.aspirantes.filter(aspirante => {
      const fechaRegistro = new Date(aspirante.fecha_registro);
      return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin;
    });
  }

  getConversionRate() {
    const aspirantesPeriodo = this.getAspirantesPorPeriodo();
    const inscritos = aspirantesPeriodo.filter(a => a.estado_semaforo.color === 'Verde').length;
    
    if (aspirantesPeriodo.length === 0) return 0;
    return Math.round((inscritos / aspirantesPeriodo.length) * 100 * 100) / 100;
  }

  logout() {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}