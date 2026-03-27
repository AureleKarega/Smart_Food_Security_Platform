import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Dashboard } from './components/dashboard/dashboard';
import { Donate } from './components/donate/donate';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Community } from './components/community/community';
import { About } from './components/about/about';
import { FoodRequest } from './components/food-request/food-request';
import { Notifications } from './components/notifications/notifications';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { adminGuard } from './guards/admin.guard';
import { AdminAuditLogs } from './components/admin-audit-logs/admin-audit-logs';
import { AdminPosts } from './components/admin-posts/admin-posts';
import { AdminListings } from './components/admin-listings/admin-listings';
import { AdminLayout } from './components/admin-layout/admin-layout';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'dashboard', component: Dashboard },
  { path: 'donate', component: Donate },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'community', component: Community },
  { path: 'about', component: About },
  { path: 'request-food', component: FoodRequest },
  { path: 'notifications', component: Notifications },
  { 
    path: 'admin', 
    component: AdminLayout, 
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AdminDashboard },
      { path: 'audit', component: AdminAuditLogs },
      { path: 'posts', component: AdminPosts },
      { path: 'listings', component: AdminListings },
      { path: '**', redirectTo: 'overview' }
    ]
  },
  { path: '**', redirectTo: '' }
];
