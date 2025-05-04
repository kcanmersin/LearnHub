import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  userData = {
    username: '',
    email: '',
    password: '',
    full_name: ''
  };
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Registration successful:', response);
        this.successMessage = 'Registration successful! You can now login.';
        setTimeout(() => this.router.navigate(['/login']), 2000); // 2 saniye sonra login'e git
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.message || 'Registration failed. Please try again.';
        console.error('Registration error:', err);
      }
    });
  }
}
