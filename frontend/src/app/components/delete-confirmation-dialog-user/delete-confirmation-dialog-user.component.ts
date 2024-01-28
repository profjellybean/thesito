import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-delete-confirmation-dialog-user',
  templateUrl: './delete-confirmation-dialog-user.component.html',
  styleUrl: './delete-confirmation-dialog-user.component.scss'
})
export class DeleteConfirmationDialogUserComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { name: string }) { }
}
