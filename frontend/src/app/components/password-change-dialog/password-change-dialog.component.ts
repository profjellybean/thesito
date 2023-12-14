import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from "../../services/user.service";

@Component({
  selector: 'app-password-change-dialog',
  templateUrl: './password-change-dialog.component.html',
})
export class PasswordChangeDialogComponent {
  passwordChangeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<PasswordChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number }
  ) {
    this.passwordChangeForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmNewPassword: ['', Validators.required],
    }, { validator: this.matchPasswords }); // Add custom validator for the entire form group
  }

  // Custom validator function for the form group
  matchPasswords(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;

    // Check if the passwords match
    return newPassword === confirmNewPassword ? null : { mismatch: true };
  }

  changePassword(): void {
    if (this.passwordChangeForm.valid) {
      // Passwords are valid, proceed with the changePassword logic
      this.userService.changePassword(
        this.passwordChangeForm.get("oldPassword")?.value,
        this.passwordChangeForm.get("newPassword")?.value,
        this.data.userId
      ).subscribe((response) => {
        // Close the dialog and notify the parent component if the password change is successful
        this.dialogRef.close('success');
      }, error => {
        this.dialogRef.close('error');
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
