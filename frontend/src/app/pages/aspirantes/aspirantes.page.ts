import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Aspirante, User, Semaforo } from '../../models/aspirante.model';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-aspirantes',
  templateUrl: './aspirantes.page.html',
  styleUrls: ['./aspirantes.page.scss'],
  standalone: false
})
export class AspirantesPage implements OnInit {
  currentUser: any;
  aspirantes: any[] = [];
  aspirantesFiltrados: any[] = [];
  semaforos: Semaforo[] = [];
  filtroSemaforo: number | null = null;
  busqueda: string = '';
  showToqueModal = false;
  showTransferModal = false;
  aspiranteSeleccionado: Aspirante | null = null;
  responsables: User[] = [];
  responsableDestino: number | null = null;

  toqueData = {
    nombre: '',
    nota: ''
  };

  constructor(
    private api: DataService,
    private router: Router,
    private storage: Storage
  ) { }

  async ngOnInit() {
    await this.storage.create()
    await this.getToken();
    this.loadData();
    const response = await this.storage.get('token');

    if (response) {
      this.currentUser = response.user;
    } else {
      console.warn('No hay datos guardados en el storage.');
    }
    console.log('este es el usuario', this.currentUser)


  }

  token = '';

  async getToken() {
    const tokenData = await this.storage.get('token');
    console.log('este es el data del token', tokenData)
    if (tokenData?.token && tokenData?.user) {
      this.token = tokenData.token;
      console.log('token:', this.token);
    } else {
      this.router.navigate(['/login']);
    }
  }

  async loadData() {
    this.semaforos = await this.api.getSemaforos();
    this.responsables = await this.api.getUsuarios();

    const behaviorSubject = await this.api.getAspirantes();
    const aspirantesArray = behaviorSubject;

    if (this.currentUser?.role.name === 'Administrador') {
      this.aspirantes = aspirantesArray;
      console.log('este es el aspirante', this.aspirantes)
    } else {
      this.aspirantes = aspirantesArray;
      console.log('este es el aspirante si no es admin', this.aspirantes)
    }

    this.aplicarFiltros();
  }

  searchTerm: string = '';

  filterAspirantes() {
    if (!this.searchTerm) {
      return this.aspirantes;  // Si no hay búsqueda, devuelve todos
    }

    const terms = this.searchTerm.toLowerCase().split(' ').filter(t => t);

      return this.aspirantes.filter(a => {
    const nombre = a.nombre?.toLowerCase() || '';
    const apellido = a.apellido?.toLowerCase() || '';
    const fullName = `${nombre} ${apellido}`;

    return terms.every(term => 
      nombre.includes(term) || 
      apellido.includes(term) ||
      fullName.includes(term)
    );
  });
  }

  aplicarFiltros() {
    let resultado = [...this.aspirantes];

    if (this.filtroSemaforo) {
      resultado = resultado.filter(a => a.estado_semaforo.documentId === this.filtroSemaforo);
    }

    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase();
      resultado = resultado.filter(a =>
        a.nombre.toLowerCase().includes(termino) ||
        a.email.toLowerCase().includes(termino) ||
        a.telefono.includes(termino)
      );
    }

    this.aspirantesFiltrados = resultado;
    console.log('estos son los filtrados', this.aspirantesFiltrados)


  }

  onFiltroChange() {
    this.aplicarFiltros();
  }

  onBusquedaChange() {
    this.aplicarFiltros();
  }

  async cambiarEstadoSemaforo(aspirante: any, semaforoId: number) {
    await this.api.actualizarEstadoSemaforo(aspirante.id, semaforoId);
  }

  abrirModalToque(aspirante: Aspirante) {
    this.aspiranteSeleccionado = aspirante;
    this.showToqueModal = true;
  }

  cerrarModalToque() {
    this.showToqueModal = false;
    this.aspiranteSeleccionado = null;
    this.toqueData = { nombre: '', nota: '' };
  }

  async agregarToque() {
    if (this.aspiranteSeleccionado && this.currentUser) {
      await this.api.agregarToque(this.aspiranteSeleccionado.id, {
        nombre: this.toqueData.nombre,
        nota: this.toqueData.nota,
        fecha: new Date(),
        responsable: this.currentUser
      });
      this.cerrarModalToque();
    }
  }

  isToqueFormValid(): boolean {
    return !!(this.toqueData.nombre && this.toqueData.nota);
  }

  abrirModalTransferencia() {
    this.showTransferModal = true;
  }

  cerrarModalTransferencia() {
    this.showTransferModal = false;
    this.responsableDestino = null;
  }

  async transferirAspirantes() {
    if (this.currentUser && this.responsableDestino) {
      await this.api.transferirAspirantes(this.currentUser.id, this.responsableDestino);
      this.cerrarModalTransferencia();
      await this.loadData();
    }
  }

  async logout() {
    await this.api.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}