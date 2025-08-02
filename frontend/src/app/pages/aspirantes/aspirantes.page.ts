import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service'; 
import { Aspirante, User, Semaforo } from '../../models/aspirante.model';

@Component({
  selector: 'app-aspirantes',
  templateUrl: './aspirantes.page.html',
  styleUrls: ['./aspirantes.page.scss'],
  standalone: false
})
export class AspirantesPage implements OnInit {
  currentUser: User | null = null;
  aspirantes: Aspirante[] = [];
  aspirantesFiltrados: Aspirante[] = [];
  semaforos: Semaforo[] = [];
  filtroSemaforo: number | null = null;
  busqueda: string = '';
  showToqueModal = false;
  showTransferModal = false;
  aspiranteSeleccionado: Aspirante | null = null;
  responsables: User[] = [];
  responsableDestino: number | null = null;

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
  }

  loadData() {
    this.semaforos = this.dataService.getSemaforos();
    this.responsables = this.dataService.getUsuarios();
    
    this.dataService.getAspirantes().subscribe(aspirantes => {
      if (this.currentUser?.rol === 'administrador') {
        this.aspirantes = aspirantes;
      } else {
        this.aspirantes = aspirantes.filter(a => a.responsable.id === this.currentUser?.id);
      }
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    let resultado = [...this.aspirantes];

    if (this.filtroSemaforo) {
      resultado = resultado.filter(a => a.estado_semaforo.id === this.filtroSemaforo);
    }

    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase();
      resultado = resultado.filter(a => 
        a.nombre.toLowerCase().includes(termino) ||
        a.apellidos.toLowerCase().includes(termino) ||
        a.email.toLowerCase().includes(termino) ||
        a.telefono.includes(termino)
      );
    }

    this.aspirantesFiltrados = resultado;
  }

  onFiltroChange() {
    this.aplicarFiltros();
  }

  onBusquedaChange() {
    this.aplicarFiltros();
  }

  cambiarEstadoSemaforo(aspirante: Aspirante, semaforoId: number) {
    this.dataService.actualizarEstadoSemaforo(aspirante.id, semaforoId);
  }

  abrirModalToque(aspirante: Aspirante) {
    this.aspiranteSeleccionado = aspirante;
    this.showToqueModal = true;
  }

  cerrarModalToque() {
    this.showToqueModal = false;
    this.aspiranteSeleccionado = null;
  }

  agregarToque(datos: any) {
    if (this.aspiranteSeleccionado && this.currentUser) {
      this.dataService.agregarToque(this.aspiranteSeleccionado.id, {
        nombre: datos.nombre,
        nota: datos.nota,
        fecha: new Date(),
        responsable: this.currentUser
      });
      this.cerrarModalToque();
    }
  }

  abrirModalTransferencia() {
    this.showTransferModal = true;
  }

  cerrarModalTransferencia() {
    this.showTransferModal = false;
    this.responsableDestino = null;
  }

  transferirAspirantes() {
    if (this.currentUser && this.responsableDestino) {
      this.dataService.transferirAspirantes(this.currentUser.id, this.responsableDestino);
      this.cerrarModalTransferencia();
      this.loadData();
    }
  }

  logout() {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}