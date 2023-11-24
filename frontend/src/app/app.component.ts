import {Component, OnInit} from '@angular/core';
import {RegisterUserComponent} from "./components/register-user/register-user.component";
import {Router} from "@angular/router";
import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(translate: TranslateService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('en');
  }
  router: Router = new Router();

  ngOnInit() {
  }
  routeToRegister() {
    console.log("Route to register")
    this.router.navigate(['register']);
  }

  protected readonly RegisterUserComponent = RegisterUserComponent;
}
