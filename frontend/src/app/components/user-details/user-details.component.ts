import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {UserType} from "../../models/User";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {constructorParametersDownlevelTransform} from "@angular/compiler-cli";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit{

  id: number;
  name: string;
  role: UserType;
  email: string;


  owner: boolean = false;

  info = false;
  infoMessage = '';

  error = false;
  errorMessage = '';

  constructor(private router: Router,
              private fb: FormBuilder,
              private userService: UserService,
              private route: ActivatedRoute,
              private authService: AuthService) {
    this.id = -1;
    this.name = "";
    this.email = "";
    this.role = UserType.ListingConsumer;
  }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.id = this.authService.getUserId();
    } else {
      setTimeout(() => {
        this.router.navigate(['/404']);
      }, 100);
    }

    let user = this.userService.getUserById(Number(this.id))
    user.subscribe({
      next: user =>{
        this.name = user.name;
        this.role = user.userType;
        this.email = user.email;
      },
      error: error2 =>{
        this.error = true;
        this.errorMessage = error2.message;
      }
    });

  }

  vanishInfo(): void {
    this.info = false;
    this.infoMessage = '';
  }

  vanishError(): void {
    this.error = false;
    this.errorMessage = '';
  }

}
