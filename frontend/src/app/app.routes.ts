import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Dashboard } from './components/dashboard/dashboard';
import { Donate } from './components/donate/donate';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Community } from './components/community/community';
import { About } from './components/about/about';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'dashboard', component: Dashboard },
  { path: 'donate', component: Donate },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'community', component: Community },
  { path: 'about', component: About },
  { path: '**', redirectTo: '' }
];
