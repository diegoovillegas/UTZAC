import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { User, EstadisticasPanel } from '../../models/aspirante.model';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  currentUser: any;
  estadisticas: EstadisticasPanel | null = null;

  constructor(
    private dataService: DataService,
    private router: Router,
    private storage: Storage
  ) { 
      this.storage.create()
  }

  async ngOnInit() {

    
    await this.storage.create()
    await this.getToken();
    this.loadEstadisticas();
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
    console.log('este es el data del token',tokenData)
  if (tokenData?.token && tokenData?.user) {
    this.token = tokenData.token;
    console.log('token:', this.token);
  } else {
    // Si falta alguno, redirigimos al login
    this.router.navigate(['/login']);
  }
}

  async loadEstadisticas() {
    this.estadisticas = await this.dataService.getEstadisticas();
  }

  aspirantes(){
    this.router.navigateByUrl('/aspirantes');
  }

  logout() {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }
}