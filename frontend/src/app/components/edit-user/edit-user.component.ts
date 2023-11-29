import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {User} from '../../models/User';
import {UserService} from '../../services/user.service';
import {AuthService} from "../../services/auth.service";
import { MatDialog } from '@angular/material/dialog';
import { PasswordChangeDialogComponent } from '../password-change-dialog/password-change-dialog.component';


import {QualificationType} from "../../models/Enums";

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  id: number;
  userForm: FormGroup;
  user: User | undefined;
  pwVisible = false;

  authToken: string = '';


  owner: boolean = false;

  info = false;
  infoMessage = '';

  error = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    this.id = -1;
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }


  openPasswordChangeDialog(): void {
    const dialogRef = this.dialog.open(PasswordChangeDialogComponent, {
      width: '500px',
      height: '300px',
      data: { userId: this.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        this.info = true;
        this.infoMessage = 'Password changed successfully';
      } else {
        this.error = true;
        this.errorMessage = 'Password couldn\'t be changed';
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()){
      this.id = this.authService.getUserId();
    }

    if (Number(this.id) == -1){
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
            userType: userData.userType,
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
        userType: this.user.userType,
        userTags: [],
        qualification: QualificationType.None
      };
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
