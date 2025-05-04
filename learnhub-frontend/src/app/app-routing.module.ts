import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
// LearnComponent'i de import etmeyi unutma (eğer daha önce etmediysen)
import { LearnComponent } from './components/learn/learn.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'learn', component: LearnComponent }, // Learn sayfası için route
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Başlangıçta login sayfasına yönlendir
  { path: '**', redirectTo: '/login' } // Bulunamayan path'leri login'e yönlendir
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
