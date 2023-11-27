import {Component} from '@angular/core';
import {registerUserQuery, User, UserType} from '../../models/User';
import {UserService} from "../../services/user.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css'
})
export class RegisterUserComponent {
  error = false;
  errorMessage = '';
  pwVisible = false;
  confirm_password: string;
  confirm_email: string;
  userService: UserService;
  user: User;
  registerForm: FormGroup;
  success = false;
  successMessage = '';
  router: Router;

  constructor(userService: UserService, formBuilder: FormBuilder, router: Router) {
    this.registerForm = formBuilder.group({
      email: ['', Validators.required],
      confirmEmail: ['', Validators.required],
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      userType: ['', Validators.required]
    });
    this.userService = userService;
    this.user = {
      id: "",
      email: "",
      name: "",
      password: "",
      userType: UserType.ListingConsumer,
    };
    this.confirm_email = "";
    this.confirm_password = "";
    this.router = router;
  }


  register() {
    if (this.registerForm.valid) {
      this.user.email = this.registerForm.get('email')?.value
      this.user.name = this.registerForm.get('name')?.value
      this.user.password = this.registerForm.get('password')?.value
      this.user.userType = this.registerForm.get('userType')?.value
      this.confirm_email = this.registerForm.get('confirmEmail')?.value
      this.confirm_password = this.registerForm.get('confirmPassword')?.value
      if (this.authenticateUser()) {
        this.userService.registerUser(this.user).subscribe(res => {
          if (res.data != null) {
            this.success = true;
            this.successMessage = 'User registered successfully';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 4000);
          }
        }, error => {
          if (error != null) {
            this.error = true;
            this.formatErrorMessage(error.message);
          }
        })
      }
    }
  }

  authenticateUser() {
    if (this.user.email !== this.confirm_email) {
      this.error = true;
      this.formatErrorMessage('Not matching emails');
      return false;
    }
    if (this.user.password !== this.confirm_password) {
      this.error = true;
      this.formatErrorMessage('Not matching passwords');
      return false;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.exec(this.user.password)) {
      this.error = true;
      this.formatErrorMessage('Invalid password');
      return false;
    }
    return true;
  }

  toggleVisibility(): void {
    this.pwVisible = !this.pwVisible;
  }

  private formatErrorMessage(error: string): void {
    switch (error) {
      case 'Invalid input':
        this.errorMessage = 'Missing username or password.';
        break;
      case 'Bad credentials':
        this.errorMessage = 'Login failed. Invalid username or password.';
        break;
      case 'Not matching emails':
        this.errorMessage = 'Emails do not match.';
        break;
      case 'Not matching passwords':
        this.errorMessage = 'Passwords do not match.';
        break;
      case 'Invalid password':
        this.errorMessage = 'Password must be at least 8 characters long and contain at least one letter and one number.';
        break;
      default:
        this.errorMessage = error;
    }
  }
}
