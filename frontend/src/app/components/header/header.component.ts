import {Component, OnChanges, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {producerGuard} from "../../guards/producer.guard";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }


  headerNeeded(): boolean{
    return !this.router.url.includes('login') && !this.router.url.includes('register') && !this.router.url.includes('404')
  }

  isLoggedIn(): boolean{
    return this.authService.isLoggedIn();
  }

  logoutUser(): void {
    this.authService.logoutUser();
  }

  isProducer(): boolean{
    return this.authService.isProducer();
  }

  isConsumer(): boolean{
    return this.authService.isConsumer();
  }
}
