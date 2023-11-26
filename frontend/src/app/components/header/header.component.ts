import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{

  authToken: string = '';
  loggedUserId: number = -1;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()){
      // @ts-ignore
      this.authToken = this.authService.getToken();
      // @ts-ignore

      const token = this.authService.decodeToken(this.authToken);
      this.loggedUserId = Number(token.upn)
      console.log(this.loggedUserId);
    }

  }

  headerNeeded(): boolean{
    return !this.router.url.includes('login') && !this.router.url.includes('register') && !this.router.url.includes('404')
  }


}
