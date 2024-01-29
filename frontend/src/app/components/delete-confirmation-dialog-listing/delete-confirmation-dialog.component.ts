import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrl: './delete-confirmation-dialog.component.scss'
})
export class DeleteConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string }) { }
}
