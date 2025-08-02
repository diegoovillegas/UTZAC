import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoggingIn = false;
  loginError = '';

  constructor(
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {

  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  fillDemoCredentials(type: 'admin' | 'responsable') {
    if (type === 'admin') {
      this.loginForm.patchValue({
        email: 'maria@utzac.edu.mx',
        password: '123456'
      });
    } else {
      this.loginForm.patchValue({
        email: 'juan@utzac.edu.mx',
        password: '123456'
      });
    }
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoggingIn = true;
      this.loginError = '';

      try {
        // Simular delay de autenticación
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { email, password } = this.loginForm.value;
        const success = this.dataService.login(email, password);

        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.loginError = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
        }
      } catch (error) {
        this.loginError = 'Error al iniciar sesión. Intenta nuevamente.';
      } finally {
        this.isLoggingIn = false;
      }
    } else {
      // Marcar campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  goToPublicForm() {
    this.router.navigate(['/registro-publico']);
  }
}