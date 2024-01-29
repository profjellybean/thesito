import {Component, Inject} from '@angular/core';
import {User} from "../../models/User";
import {Listing} from "../../models/Listing";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Form, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ListingService} from "../../services/listing.service";
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-application-dialog',
  templateUrl: './application-dialog.component.html',
  styleUrl: './application-dialog.component.css'
})
export class ApplicationDialogComponent {
  listing: Listing;
  applicationForm: FormGroup;
  disableSubmit = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
                listingId: number
              }, public dialogRef: MatDialogRef<ApplicationDialogComponent>,
              private formBuilder: FormBuilder,
              private listingService: ListingService, private router: Router, private userService: UserService) {
    listingService.getListingById(this.data.listingId).subscribe((listing: Listing) => {
      this.listing = listing;
    }, e => {
      this.router.navigate(['/404']);
    });
    this.applicationForm = this.formBuilder.group({
      text: ['', Validators.required],
    })
  }


  apply() {
    this.disableSubmit = true;
    // @ts-ignore
    if (this.applicationForm.valid) {
      this.userService.getCurrentUser().subscribe((user: User) => {
        const text = this.applicationForm.get('text')?.value;
        if (this.listing?.id && user?.id) {
          this.listingService.applyToListing(parseInt(this.listing.id), user.id, text).subscribe((msg) => {
            this.dialogRef.close('success');
          }, error => {
            this.dialogRef.close('success'); //is currently always successful because bug with backend
          });
        }
      })
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
