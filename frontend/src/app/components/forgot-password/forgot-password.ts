import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { httpErrorMessage } from '../../http-error-message';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: '../login/login.scss',
})
export class ForgotPassword {
  email = '';
  error = signal('');
  success = signal('');
  loading = signal(false);

  constructor(private auth: AuthService) {}

  onSubmit() {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);
    this.auth.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.success.set(res.message);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(httpErrorMessage(err, 'Request failed'));
        this.loading.set(false);
      }
    });
  }
}
