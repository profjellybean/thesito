import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {Router} from '@angular/router';


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
  clickCounter = 0;
  mail: "";
  password: "";
  error = false;
  success = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      emailOrName: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })
    this.password = "";
    this.mail = "";
    this.authService = authService;
  }

  login() {
    this.submitted = true;
    this.authenticateUser()
  }

  authenticateUser() {
    this.mail = this.loginForm.get("emailOrName")?.value
    this.password = this.loginForm.get("password")?.value
    console.log(this.mail);
    console.log(this.password);

    this.authService.getSession(this.mail, this.password).subscribe(
      res => {
        if (res) {
          this.success = true;
          this.successMessage = 'User logged in';
          this.router.navigate(['/home']);
        }
      }, error => {
        console.log(error.message)
        this.error = true;
        this.formatErrorMessage(error.message)
      })
  }

  vanishError() {
    this.error = false;
  }

  private formatErrorMessage(error: string): void {
    switch (error) {
      case 'Invalid input':
        this.errorMessage = 'Missing username or password.';
        break;
      case 'Bad credentials':
        this.errorMessage = 'Login failed. Invalid username or password.';
        break;
      default:
        this.errorMessage = 'Something went wrong, try again later.';
    }
  }

  toggleVisibility(): void {
    this.pwVisible = !this.pwVisible;
  }

  goToRegistration(): void {
    this.router.navigate(['./register']);
  }

}
