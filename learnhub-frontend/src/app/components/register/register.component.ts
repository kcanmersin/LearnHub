import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  userData = {
    username: '',
    email: '',
    password: '',
    full_name: ''
  };
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  hidePassword: boolean = true;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/learn']);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Registration successful! Redirecting to login...';

        // Clear the form
        this.userData = {
          username: '',
          email: '',
          password: '',
          full_name: ''
        };

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;

        if (err?.error?.detail?.includes('already registered')) {
          this.errorMessage = 'This username or email is already registered';
        } else {
          this.errorMessage = err?.error?.detail ||
                             err?.message ||
                             'Registration failed. Please try again later.';
        }

        console.error('Registration error:', err);
      }
    });
  }
}
