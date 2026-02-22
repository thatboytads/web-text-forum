import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Posts } from './components/posts/posts';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'posts', component: Posts, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' }
];

