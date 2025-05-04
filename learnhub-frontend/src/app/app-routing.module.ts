import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LearnComponent } from './components/learn/learn.component';
import { MyWordsComponent } from './components/my-words/my-words.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'learn', component: LearnComponent },
  {
    path: 'my-words',
    component: MyWordsComponent,
    canActivate: [AuthGuard]
   },
  { path: '', redirectTo: '/learn', pathMatch: 'full' },
  { path: '**', redirectTo: '/learn' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
