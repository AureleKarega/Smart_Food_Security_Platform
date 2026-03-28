import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { httpErrorMessage } from '../../http-error-message';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: '../login/login.scss',
})
export class ResetPassword implements OnInit {
  email = '';
  token = '';
  password = '';
  confirmPassword = '';
  error = signal('');
  success = signal('');
  loading = signal(false);
  linkInvalid = signal(false);

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p) => {
      this.token = String(p['token'] || '').trim();
      this.email = String(p['email'] || '').trim();
      if (!this.token || !this.email) {
        this.linkInvalid.set(true);
      }
    });
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    this.error.set('');
    this.success.set('');
    this.loading.set(true);
    this.auth
      .resetPassword({
        email: this.email,
        token: this.token,
        password: this.password
      })
      .subscribe({
        next: (res) => {
          this.success.set(res.message);
          this.loading.set(false);
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.error.set(httpErrorMessage(err, 'Could not reset password'));
          this.loading.set(false);
        }
      });
  }
}
