import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  showPassword = false;
  isLoggingIn = false;
  loginError = '';
   isLoading = false;

  constructor(
    private api: DataService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private storage: Storage
  ) {

  }

  loginForm = {
    identifier: '',
    password: ''
  };

  ngOnInit() {

  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  usuariosDemo = [
    { identifier: 'maria@utzac.edu.mx', password: '12345678' },
    { identifier: 'juan@utzac.edu.mx', password: '123456' }
  ]

  async usarCredencialesDemo(usuario: any) {
    this.loginForm.identifier = usuario.identifier;
    this.loginForm.password = usuario.password;
    await this.mostrarToast(`Credenciales cargadas para ${usuario.identifier}`, 'primary');
  }

  async onLogin() {
    if (!this.validarFormulario()) {
      return;
    }

    const loading = await this.mostrarLoading();
    this.isLoading = true;

    try {
      
      const data = {
        identifier: this.loginForm.identifier,
        password: this.loginForm.password,
      }
      console.log(data)
      const response = await this.api.login(data);
      this.storage.set('token', response)
      await loading.dismiss();
      console.log(response.user.role)

      await this.mostrarToast(`¡Bienvenido ${response.user.nombre}!`, 'success');

      this.router.navigate(['/dashboard']);

    } catch (error: any) {
      await loading.dismiss();
      await this.mostrarAlerta('Error de Autenticación', error.message || 'Credenciales incorrectas');
    } finally {
      this.isLoggingIn = false;
    }
  }

  private validarFormulario(): boolean {
    if (!this.loginForm.identifier.trim()) {
      this.mostrarAlerta('Error', 'El email es requerido');
      return false;
    }

    if (!this.loginForm.password.trim()) {
      this.mostrarAlerta('Error', 'La contraseña es requerida');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginForm.identifier)) {
      this.mostrarAlerta('Error', 'Ingrese un email válido');
      return false;
    }

    return true;
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  async mostrarLoading() {
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  goToPublicForm() {
    this.router.navigate(['/registro-publico']);
  }
}