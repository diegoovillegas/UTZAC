import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { User, EstadisticasPanel } from '../../models/aspirante.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  estadisticas: EstadisticasPanel | null = null;

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
    
    this.loadEstadisticas();
  }

  loadEstadisticas() {
    this.estadisticas = this.dataService.getEstadisticas();
  }

  logout() {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }
}