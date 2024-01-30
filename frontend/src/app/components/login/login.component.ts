import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {Router} from '@angular/router';
import {ToastrService} from "ngx-toastr";
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup;
  pwVisible = false;
  submitted = false;
  authService: AuthService;
  mail: "";
  password: "";

  translateService: TranslateService;

  constructor(
    authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    translateService: TranslateService
  ) {
    this.loginForm = this.fb.group({
      emailOrName: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
    this.password = "";
    this.mail = "";
    this.authService = authService;
    this.translateService = translateService;
  }

  login() {
    this.submitted = true;
    this.authenticateUser()
  }

  authenticateUser() {
    this.mail = this.loginForm.get("emailOrName")?.value
    this.password = this.loginForm.get("password")?.value

    this.authService.getSession(this.mail, this.password).subscribe(
      res => {
        if (res) {
          this.router.navigate(['/home']);
        } else {
          this.formatErrorMessage('Bad credentials')
        }
      }, error => {
        this.formatErrorMessage(error.message)
      })
  }


  private formatErrorMessage(error: string): void {
    this.translateService.get(error).subscribe((res: string) => {
      this.toastr.error(res, 'Error');
    }, e => {
      this.toastr.error(error, 'Error');
    });
  }

  toggleVisibility(): void {
    this.pwVisible = !this.pwVisible;
  }

  goToRegistration(): void {
    this.router.navigate(['./register']);
  }

}
