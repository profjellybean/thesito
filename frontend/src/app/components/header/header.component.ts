import {Component, OnChanges, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {producerGuard} from "../../guards/producer.guard";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  loggedUserName: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.userService.getUserById(this.authService.getUserId()).subscribe(result =>{
      this.loggedUserName = result.name;
      console.log(this.loggedUserName);
    })
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

  isAdministartor(): boolean{
    return this.authService.isAdministrator()
  }

  isConsumer(): boolean{
    return this.authService.isConsumer();
  }

  goToHome(): void{
    this.router.navigate(['/home']);
  }
}
