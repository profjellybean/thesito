import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from "../../models/User";
import { UserService } from "../../services/user.service";
import { QualificationType, UserType } from "../../models/Enums";

@Component({
  selector: 'app-admin-edit-user',
  templateUrl: 'admin-edit-user.component.html',
  styleUrls: ['admin-edit-user.component.css']
})
export class AdminEditUserComponent implements OnInit {
  editUserForm: FormGroup;

  isConsumerUser: boolean;
  isProviderUser: boolean;
  isAdminUser: boolean;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<AdminEditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    // Set the initial checkbox states based on the injected user data
    this.isConsumerUser = this.data.user.userType.includes(UserType.ListingConsumer);
    this.isProviderUser = this.data.user.userType.includes(UserType.ListingProvider);
    this.isAdminUser = this.data.user.userType.includes(UserType.Administrator);
  }

  ngOnInit(): void {
    this.editUserForm = this.fb.group({
      name: [this.data.user.name, Validators.required],
      email: [this.data.user.email, [Validators.required, Validators.email]],
      qualification: [this.data.user.qualification],
      receiveEmails: [this.data.user.receiveEmails === null ? 'none' : this.data.user.receiveEmails ? 'yes' : 'no']
    });
  }

  onSave(): void {
    if (this.editUserForm.valid) {
      let formValue = this.editUserForm.value;
      let userType: UserType[] = [];
      if (this.isConsumerUser) userType.push(UserType.ListingConsumer);
      if (this.isProviderUser) userType.push(UserType.ListingProvider);
      if (this.isAdminUser) userType.push(UserType.Administrator);

      let updatedUser: User = {
        ...this.data.user,
        name: formValue.name,
        email: formValue.email,
        userType: userType,
        qualification: this.isConsumerUser ? formValue.qualification : QualificationType.None,
        receiveEmails: formValue.receiveEmails === 'yes',
        password: ''
      };

      this.userService.updateUser(updatedUser).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  toggleUserType(type: UserType) {
    // Ensure at least one checkbox is always selected
    if (this.isOnlyOneSelected() && this.isCurrentlySelected(type)) {
      return; // Do nothing if trying to uncheck the last remaining checkbox
    }

    switch (type) {
      case UserType.ListingConsumer:
        this.isConsumerUser = !this.isConsumerUser;
        break;
      case UserType.ListingProvider:
        this.isProviderUser = !this.isProviderUser;
        break;
      case UserType.Administrator:
        this.isAdminUser = !this.isAdminUser;
        break;
    }
  }

  private isOnlyOneSelected(): boolean {
    const selectedCount = [this.isConsumerUser, this.isProviderUser, this.isAdminUser].filter(v => v).length;
    return selectedCount === 1;
  }

  private isCurrentlySelected(type: UserType): boolean {
    switch (type) {
      case UserType.ListingConsumer:
        return this.isConsumerUser;
      case UserType.ListingProvider:
        return this.isProviderUser;
      case UserType.Administrator:
        return this.isAdminUser;
      default:
        return false;
    }
  }

  protected readonly UserType = UserType;
}
