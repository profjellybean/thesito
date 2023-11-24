import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RegisterUserComponent} from "./components/register-user/register-user.component";
import {HomeComponent} from "./components/home/home.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterUserComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
