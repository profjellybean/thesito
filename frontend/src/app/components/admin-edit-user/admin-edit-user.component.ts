import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {User} from "../../models/User";
import {UserService} from "../../services/user.service";
import {QualificationType} from "../../models/Enums";

@Component({
  selector: 'app-admin-edit-user',
  templateUrl: 'admin-edit-user.component.html',
  styleUrls: ['admin-edit-user.component.css']
})
export class AdminEditUserComponent implements OnInit {
  editUserForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public dialogRef: MatDialogRef<AdminEditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  ngOnInit(): void {
    this.editUserForm = this.fb.group({
      name: [this.data.user.name, Validators.required],
      email: [this.data.user.email, [Validators.required, Validators.email]],
      userType: [this.data.user.userType, Validators.required],
      qualification: [this.data.user.qualification],
      receiveEmails: [this.data.user.receiveEmails === null ? 'none' : this.data.user.receiveEmails ? 'yes' : 'no']

    });
  }
  onSave(): void {
    if (this.editUserForm.valid) {
      let formValue = this.editUserForm.value;
      let updatedUser: User = {
        ...this.data.user,
        name: formValue.name,
        email: formValue.email,
        userType: formValue.userType,
        qualification: formValue.userType === 'ListingConsumer' ? formValue.qualification : QualificationType.None,
        receiveEmails: formValue.receiveEmails === 'yes',
        password: ''
      };

      console.log(updatedUser)

      this.userService.updateUser(updatedUser).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }
}
