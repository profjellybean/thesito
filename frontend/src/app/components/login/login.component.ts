import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm: FormGroup;
  pwVisible = false;
  submitted = false;
  error = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      emailOrName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    })
  }

  ngOnInit(){}

  login(){
    this.submitted = true;
    if (this.loginForm.valid){
      this.authenticateUser()
    }else{
      this.error = true;
      this.formatErrorMessage('Invalid input')
    }
  }

  authenticateUser() {
    //TODO
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
