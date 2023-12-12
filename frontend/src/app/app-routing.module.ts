import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {NotFoundComponent} from "./components/not-found/not-found.component";
import {RegisterUserComponent} from "./components/register-user/register-user.component";
import {HomeComponent} from "./components/home/home.component";
import {AllComponent} from "./components/all/all.component";
import {authGuard} from "./guards/auth.guard";
import {LanguageToggleComponent} from "./components/language-toggle/language-toggle.component";
import {UserDetailsComponent} from "./components/user-details/user-details.component";
import {CreateListingComponent} from "./components/create-listing/create-listing.component";
import {EditUserComponent} from "./components/edit-user/edit-user.component";
import {EditListingComponent} from "./components/edit-listing/edit-listing.component";
import {DetailComponent} from "./components/detail/detail.component";
import {MyListingsComponent} from "./components/my-listings/my-listings.component";
import {producerGuard} from "./guards/producer.guard";


export const routes: Routes = [
  {path: '', pathMatch: 'full', canActivate: [authGuard], component: AllComponent},
  {path: 'home', canActivate: [authGuard], component: HomeComponent},
  {path: 'all', canActivate: [authGuard], component: AllComponent},
  {path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterUserComponent },
  { path: 'user', canActivate: [authGuard], component: UserDetailsComponent },
  {path: 'listing/create', canActivate: [authGuard, producerGuard], component: CreateListingComponent},
  {path: 'listing/:id', canActivate: [authGuard], component: DetailComponent},
  {path: 'listing/edit/:id', canActivate: [authGuard, producerGuard], component: EditListingComponent},
  //{ path: 'user/:id', canActivate: [authGuard], component: UserDetailsComponent },
  {path: 'user/edit', canActivate: [authGuard], component: EditUserComponent},
  {path: 'user/listings', canActivate: [authGuard, producerGuard], component: MyListingsComponent},
  {path: '**', pathMatch: 'full', redirectTo: '404'},
  {path: '404', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
