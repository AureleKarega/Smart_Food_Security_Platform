import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { httpErrorMessage } from '../../http-error-message';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  name = '';
  email = '';
  studentId = '';
  password = '';
  confirmPassword = '';
  accountType: 'client' | 'administrator' = 'client';
  adminSignupCode = '';
  error = signal('');
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    if (this.accountType === 'administrator' && !this.adminSignupCode.trim()) {
      this.error.set('Admin sign-up code is required for administrator accounts');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.auth.register({
      name: this.name,
      email: this.email,
      password: this.password,
      studentId: this.studentId,
      accountType: this.accountType,
      adminSignupCode: this.accountType === 'administrator' ? this.adminSignupCode.trim() : undefined
    }).subscribe({
      next: () => {
        if (this.auth.isAdminOrModerator()) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error.set(httpErrorMessage(err, 'Registration failed'));
        this.loading.set(false);
      }
    });
  }
}
