import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserType, User } from '../../models/User';
import { UserService } from '../../services/user.service';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  id: string;
  userForm: FormGroup;
  user: User | undefined;
  pwVisible = false;

  authToken: string = '';
  loggedUserId: number = -1;


  owner: boolean = false;

  info = false;
  infoMessage = '';

  error = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
  private router: Router,
  private authService: AuthService
  ) {
    this.id = '';
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],  // Initialize as empty
      role: [UserType.ListingConsumer, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.id = params['id'];
    });

    if (this.authService.isLoggedIn()){
      // @ts-ignore
      this.authToken = this.authService.getToken();
      // @ts-ignore

      const token = this.authService.decodeToken(this.authToken);
      this.loggedUserId = Number(token.upn)
    }

    if (Number(this.id) != this.loggedUserId){
      setTimeout(() => {
        this.router.navigate(['/404']);
      }, 100);
    } else {
      let user = this.userService.getUserById(Number(this.id));
      user.subscribe({
        next: (userData) => {
          this.user = userData;
          this.userForm.patchValue({
            name: userData.name,
            email: userData.email,
            password: '',  // Set the password field as empty in the form
            role: userData.userType
          });
        },
        error: (error2) => {
          this.error = true;
          this.errorMessage = error2.message;
        }
      });
    }
  }

  vanishInfo(): void {
    this.info = false;
    this.infoMessage = '';
  }

  toggleVisibility(): void {
    this.pwVisible = !this.pwVisible;
  }

  vanishError(): void {
    this.error = false;
    this.errorMessage = '';
  }

  submitForm(): void {
    if (this.userForm.valid && this.user) {
      const updatedUser: User = {
        id: this.user.id,
        name: this.userForm.get('name')?.value,
        email: this.userForm.get('email')?.value,
        password: this.userForm.get('password')?.value,
        userType: this.userForm.get('role')?.value
      };
      console.log(updatedUser);
      // Call the service method to update the user
      this.userService.updateUser(updatedUser).subscribe(
        () => {
          this.info = true;
          this.infoMessage = 'User updated successfully';
        },
        (error) => {
          this.error = true;
          this.errorMessage = error.message;
        }
      );
    }
  }
}
