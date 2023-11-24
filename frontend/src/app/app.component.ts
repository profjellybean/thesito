import {Component, OnInit} from '@angular/core';
import {Apollo} from "apollo-angular";
import {gql} from "@apollo/client";
import {User} from "./models/User";
import {RegisterUserComponent} from "./components/register-user/register-user.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  router: Router = new Router();

  ngOnInit() {
  }
  routeToRegister() {
    console.log("Route to register")
    this.router.navigate(['register']);
  }

  protected readonly RegisterUserComponent = RegisterUserComponent;
}
