import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {User} from '../../models/User';
import {UserService} from '../../services/user.service';
import {AuthService} from "../../services/auth.service";
import {MatDialog} from '@angular/material/dialog';
import {PasswordChangeDialogComponent} from '../password-change-dialog/password-change-dialog.component';
import {MatSnackBar} from "@angular/material/snack-bar";
import {QualificationType, UserType} from "../../models/Enums";
import {Tag} from "../../models/Tag";
import {TranslateService} from "@ngx-translate/core";
import {DeleteConfirmationDialogUserComponent} from "../delete-confirmation-dialog-user/delete-confirmation-dialog-user.component";
import {ChangeUsertypeDialogComponent} from "../change-usertype-dialog/change-usertype-dialog.component";

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

  mustBeLoggedOutConsumer = false;
  mustBeLoggedOutProvider = false;

  name: string = '';
  email: string = '';

  selectedTags: Tag[] = [];

  academicCareer: QualificationType | undefined = QualificationType.None;

  info = false;
  infoMessage = '';

  error = false;
  errorMessage = '';

  isConsumerUser = false;
  isProviderUser = false;
  isAdminUser = false;

  tagsLoaded = false;

  dataLoaded = false;


  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.id = -1;
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      isConsumer: [this.isConsumerUser],
      isProvider: [this.isProviderUser],
      userTags: [],
      qualification: [QualificationType.None],
      receiveEmails: [true]
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
        this.errorMessage = this.translate.instant('passwordChangeSuccess')
      } else if(result === undefined){
      }
      else {
        this.error = true;
        this.errorMessage = this.translate.instant('passwordChangeFailed')
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

          this.isConsumerUser = this.user.userType.includes(UserType.ListingConsumer);
          this.isProviderUser = this.user.userType.includes(UserType.ListingProvider);
          this.isAdminUser = this.user.userType.includes(UserType.Administrator);

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
            qualification: userData.qualification,
          });
          this.tagsLoaded = true;
        },
        error: (error2) => {
          this.error = true;
          this.errorMessage = error2.message;
        }
      });
      this.dataLoaded = true;
    }
  }

  onDeleteButtonClick(): void{
    const dialogRef = this.dialog.open(DeleteConfirmationDialogUserComponent, {
      data: { name: this.user?.name } // Safely access the user's name using optional chaining
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUserById(Number(this.user?.id)).subscribe({
          next: () => {
            this.showSuccessMessage();
            // Navigate to the login page after successful deletion
            this.router.navigate(['/login']);
          },
          error: (error) => {
            this.error = true;
            this.errorMessage = error.message;
          },
        });
      }
    });
  }

  private showSuccessMessage(): void {
    const translatedMessage = this.translateService.instant('userDeletedSuccessfully');
    const translatedClose = this.translateService.instant('close');

    // Open the snackbar with the translated message
    this.snackBar.open(translatedMessage, translatedClose, {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-success']
    });
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

  addTagToUser(tags: Tag[]): void {
    this.selectedTags = tags;
  }

  submitForm(): void {
    if (this.userForm.valid && this.user) {
      this.name = this.userForm.get('name')?.value;
      this.email = this.userForm.get('email')?.value;
      let qualification = this.userForm.get('qualification')?.value;

      this.user.userType = [...[]]

      if (this.isAdminUser){
        this.user.userType = [...this.user.userType, UserType.Administrator];
      }

      if (this.isConsumerUser){
        this.user.userType = [...this.user.userType, UserType.ListingConsumer];
      }
      if (this.isProviderUser){
        this.user.userType = [...this.user.userType, UserType.ListingProvider];
      }
      if(qualification !=null){
        this.user = {
          ...this.user,
          name: this.name,
          email: this.email,
          userTags: this.selectedTags,
          qualification: qualification,
        };
      } else {
        this.user = {
          ...this.user,
          name: this.name,
          email: this.email,
          userTags: this.selectedTags,
        };
      }


      this.vanishError(); // Clear any previous errors
      this.vanishInfo();  // Clear any previous info messages

      this.userService.updateUser(this.user).subscribe({
        next: result => {
          this.info = true;
          this.infoMessage = 'userUpdateSuccess';
          if(this.mustBeLoggedOutConsumer || this.mustBeLoggedOutProvider){
            this.authService.removeTokens();
          }
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

  isConsumer() {
    return this.isConsumerUser;
  }
  isProvider() {
    return this.isProviderUser;
  }

  toggleConsumer() {
    this.isConsumerUser = !this.isConsumerUser;
    this.mustBeLoggedOutConsumer = !this.mustBeLoggedOutConsumer;
  }

  toggleProvider() {
    this.isProviderUser = !this.isProviderUser;
    this.mustBeLoggedOutProvider = !this.mustBeLoggedOutProvider;
  }

  isLoggedIn(): boolean{
    return this.authService.isLoggedIn();
  }

  openUserTypeConfirmationDialog(){
    const dialogRef = this.dialog.open(ChangeUsertypeDialogComponent);

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.submitForm()
      }
    });
  }

  protected readonly QualificationType = QualificationType;
}
