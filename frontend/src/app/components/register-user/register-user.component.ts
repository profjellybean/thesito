import {Component} from '@angular/core';
import {User} from '../../models/User';
import {UserService} from "../../services/user.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Tag} from "../../models/Tag";
import {TranslateService} from "@ngx-translate/core";

import {QualificationType, UserType} from "../../models/Enums";

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
  isConsumerUser = true;

  constructor(private translateService: TranslateService, userService: UserService, formBuilder: FormBuilder, router: Router) {
    this.registerForm = formBuilder.group({
      email: ['', Validators.required],
      confirmEmail: ['', Validators.required],
      name: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      userType: ['', Validators.required]
    });
    this.userService = userService;
    this.user = {
      id: -1,
      email: "",
      name: "",
      password: "",
      userType: UserType.ListingConsumer,
      userTags: [],
      qualification: QualificationType.None
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
            }, 2000);
          }
        }, error => {
          if (error != null) {
            this.error = true;
            this.formatErrorMessage(error.message);
          }
        })
      }
    } else {
      this.error = true;
      this.formatErrorMessage('invalidInput');
    }
  }

  addTagToUser(tag: Tag[]): void {
    this.user.userTags = tag;
  }

  authenticateUser() {
    if (this.user.email !== this.confirm_email) {
      this.error = true;
      this.formatErrorMessage('emailMatchError');
      return false;
    }
    if (this.user.password !== this.confirm_password) {
      this.error = true;
      this.formatErrorMessage('pwMatchError');
      return false;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[\s\S]{8,}$/.exec(this.user.password)) {
      this.error = true;
      this.formatErrorMessage('pwError');
      return false;
    }
    if(this.user.userType.toString() === "ListingConsumer" &&  (this.user.userTags === undefined || this.user.userTags.length === 0)) {
      this.error = true;
      this.formatErrorMessage('tagError');
      return false;
    }
    return true;
  }

  toggleVisibility(): void {
    this.pwVisible = !this.pwVisible;
  }

  private formatErrorMessage(error: string): void {
    this.translateService.get(error).subscribe((res: string) => {
      this.errorMessage = res;
    }, e => {
      this.errorMessage = error;
    });
  }
  isConsumer() {
    this.isConsumerUser = this.registerForm.value.userType === "ListingConsumer";
  }
}
