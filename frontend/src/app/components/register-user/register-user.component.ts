import {Component} from '@angular/core';
import {User} from '../../models/User';
import {UserService} from "../../services/user.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Tag} from "../../models/Tag";
import {TranslateService} from "@ngx-translate/core";

import {QualificationType, UserType} from "../../models/Enums";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css'
})
export class RegisterUserComponent {
  showAdditionalRegistration: boolean = false;
  pwVisible = false;
  confirm_password: string;
  confirm_email: string;
  userService: UserService;
  user: User;
  registerForm: FormGroup;
  router: Router;
  isConsumerUser = false;
  isProviderUser = false;
  selectedTags: Tag[] = [];

  constructor(private translateService: TranslateService, userService: UserService, formBuilder: FormBuilder, router: Router, private toastr: ToastrService) {
    this.registerForm = formBuilder.group({
      email: ['', Validators.required],
      confirmEmail: ['', Validators.required],
      name: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      userType: ['', Validators.required],
      qualification: [''],

    });
    this.userService = userService;
    this.user = {
      email: "",
      name: "",
      password: "",
      userType: [],
      userTags: [],
      receiveEmails: true
    };
    this.confirm_email = "";
    this.confirm_password = "";
    this.router = router;
  }


  register() {
    // Check if both main and additional forms are valid
    if (this.registerForm.valid) {
      // Populate user data from registerForm
      this.user.email = this.registerForm.get('email')?.value;
      this.user.name = this.registerForm.get('name')?.value;
      this.user.password = this.registerForm.get('password')?.value;

      // Populate user type from additionalRegisterForm
      if (this.isConsumerUser){
        this.user.userType.push(UserType.ListingConsumer)
      }
      if (this.isProviderUser){
        this.user.userType.push(UserType.ListingProvider)
      }
      this.confirm_email = this.registerForm.get('confirmEmail')?.value
      this.confirm_password = this.registerForm.get('confirmPassword')?.value
      this.user.qualification = this.registerForm.get('qualification')?.value
      if(this.isConsumerUser && (this.user.userTags === undefined || this.user.userTags.length < 3)) {
        this.formatErrorMessage('notEnoughTagsError');
        return;
      }
      if(this.isConsumerUser && (this.user.qualification === undefined || this.registerForm.get('qualification')?.value === "")) {
        this.formatErrorMessage('qualificationError');
        return;
      }
      if (this.isProviderUser && !this.isConsumerUser) {
        this.user.qualification = undefined;
      }

      // Validate user data
      if (this.authenticateUser()) {
        // Call the user service to register the user
        this.userService.registerUser(this.user).subscribe(res => {
          if (res.data != null) {
            // Registration successful
            this.formatSuccessMessage('User registered successfully');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
        }, error => {
          // Registration failed
          if (error != null) {
            this.formatErrorMessage(error.message);
          }
        });
      }
    } else {
      // Form validation failed
      this.formatErrorMessage('invalidInput');
    }
  }


  addTagToUser(tag: Tag[]): void {
    this.user.userTags = tag;
  }

  authenticateUser() {
    if (this.user.email !== this.confirm_email) {
      this.formatErrorMessage('emailMatchError');
      return false;
    }
    if (this.user.password !== this.confirm_password) {
      this.formatErrorMessage('pwMatchError');
      return false;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[\s\S]{8,}$/.exec(this.user.password)) {
      this.formatErrorMessage('pwError');
      return false;
    }
    if(this.user.userType.toString() === "ListingConsumer" &&  (this.user.userTags === undefined || this.user.userTags.length === 0)) {
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
      this.toastr.error(res, 'Error');
    }, e => {
      this.toastr.error(error, 'Error');
    });
  }

  private formatSuccessMessage(success: string): void {
    this.translateService.get(success).subscribe((res: string) => {
      this.toastr.success(res, 'Success');
    }, e => {
      this.toastr.success(e, 'Success');
    });
  }

  isConsumer() {
    this.isConsumerUser = !this.isConsumerUser;
  }
  isProvider() {
    this.isProviderUser = !this.isProviderUser;
  }

  protected readonly QualificationType = QualificationType;
}
