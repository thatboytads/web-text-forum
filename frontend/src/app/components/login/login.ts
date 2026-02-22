import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize, switchMap } from 'rxjs';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  isRegisterMode = false;
  selectedRole: UserRole = UserRole.REGULAR;
  readonly roles = UserRole;

  constructor(private authService: AuthService, private router: Router) {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/posts']);
    }
  }

  onSubmit(): void {
    if (this.isRegisterMode) {
      this.register();
      return;
    }

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: () => {
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          this.isLoading = false;
          this.authService.clearSession();
          const apiDetail = error?.error?.detail;
          if (apiDetail) {
            this.errorMessage = apiDetail;
          } else if (error?.status === 401) {
            this.errorMessage = 'Invalid username or password';
          } else if (error?.status === 0) {
            this.errorMessage = 'Unable to reach the server. Please try again.';
          } else {
            this.errorMessage = 'Login failed. Please try again.';
          }
          console.error('Login error:', error);
        }
      });
  }

  private register(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.username, this.password, this.selectedRole)
      .pipe(
        switchMap(() => this.authService.login(this.username, this.password)),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/posts']);
        },
        error: (error) => {
          this.authService.clearSession();
          const apiDetail = error?.error?.detail;
          if (apiDetail) {
            this.errorMessage = apiDetail;
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
          console.error('Register error:', error);
        }
      });
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
  }
}
