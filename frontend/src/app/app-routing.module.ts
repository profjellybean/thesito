import {RegisterUserComponent} from "./components/register-user/register-user.component";
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./login/login.component";


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterUserComponent },
  { path: 'login', pathMatch: 'full', component: LoginComponent }
];
