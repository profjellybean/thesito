import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {User} from '../../models/User';
import {UserService} from '../../services/user.service';
import {AuthService} from "../../services/auth.service";
import {MatDialog} from '@angular/material/dialog';
import {PasswordChangeDialogComponent} from '../password-change-dialog/password-change-dialog.component';


import {QualificationType} from "../../models/Enums";
import {Tag} from "../../models/Tag";

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

  name: string = '';
  email: string = '';

  selectedTags: Tag[] = [];

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
    this.info = false;
    this.infoMessage = '';
    this.error = false;
    this.errorMessage = '';
  }


  openPasswordChangeDialog(): void {
    const dialogRef = this.dialog.open(PasswordChangeDialogComponent, {
      width: '450px',
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
          this.user = {
            ...this.user,  // Copy existing properties
            password: ''
          };

          if (!this.user.qualification){
            this.user.qualification = QualificationType.None;
          }

          this.user.userTags.forEach(tag =>{
            let t = {
              id: tag.id,
              layer: tag.layer,
              title_de: tag.title_de,
              title_en: tag.title_en
            }
            this.selectedTags.push(t)
          });

          this.userForm.patchValue({
            name: userData.name,
            email: userData.email,
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
      this.name = this.userForm.get('name')?.value;
      this.email = this.userForm.get('email')?.value;

      this.user = {
        ...this.user,
        name: this.name,
        email: this.email,
        userTags: this.selectedTags
      };

      this.vanishError(); // Clear any previous errors
      this.vanishInfo();  // Clear any previous info messages

      this.userService.updateUser(this.user).subscribe({
        next: result => {
          this.info = true;
          this.infoMessage = 'userUpdateSuccess';
        },
        error: error => {
          this.error = true;
          this.errorMessage = error.message;
        }
      });
    }
  }

  toggleReceiveEmails(){
    if (this.user){
      this.user.receiveEmails = !this.user.receiveEmails;
    }
  }


}
