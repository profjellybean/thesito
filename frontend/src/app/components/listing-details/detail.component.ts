import {Component, Inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Listing} from "../../models/Listing";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {ApplicationDialogComponent} from "../application-dialog/application-dialog.component";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {ListingService} from "../../services/listing.service";
import {User} from "../../models/User";
import {UserType} from "../../models/Enums";
import { LanguageService } from '../../services/language.service';
import {DeleteConfirmationDialogComponent} from "../delete-confirmation-dialog/delete-confirmation-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit{
  listingId: number = -1;
  listing: Listing;
  success = false;
  successMessage = '';
  error = false;
  errorMessage = '';
  owner: User;
  ownership = false;
  canApply = false;
  currentLanguage = 'en';


  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private dialog: MatDialog,
      private translateService: TranslateService,
      private listingService: ListingService,
      private snackBar: MatSnackBar,
      private userService: UserService,
      private authService: AuthService,
      private languageService: LanguageService,
      @Inject(MAT_DIALOG_DATA) public data: { listingId: number }
  ) {
    this.route.params.subscribe(params => {
      if(this.data.listingId != -1){
        this.listingId = this.data.listingId;
      }else{
        this.listingId = params['id'];
      }
    });
  }

  openApplicationDialog(): void {
    const dialogRef = this.dialog.open(ApplicationDialogComponent, {
      width: '70em',
      height: '50em',
      data: { listingId: this.listingId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        this.success = true;
        this.formatSuccessMessage('applicationSuccess')
      } else {
        this.error = true;
        this.formatErrorMessage('applicationError')
      }
    });
  }

  onDeleteButtonClick(listing: Listing): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: { title: listing.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.listingService.deleteListingById(Number(listing.id)).subscribe({
          next: () => {
            this.showSuccessMessage();
            // Navigate to the home page after successful deletion
            this.router.navigate(['/home']);
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
    const translatedMessage = this.translateService.instant('listingDeletedSuccessfully');
    const translatedClose = this.translateService.instant('close');

    // Open the snackbar with the translated message
    this.snackBar.open(translatedMessage, translatedClose, {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-success']
    });
  }

  private formatErrorMessage(error: string): void {
    this.translateService.get(error).subscribe((res: string) => {
      this.errorMessage = res;
    }, e => {
      this.errorMessage = error;
    });
  }

  private formatSuccessMessage(success: string): void {
    this.translateService.get(success).subscribe((res: string) => {
      this.successMessage = res;
    }, e => {
      this.successMessage = success;
    });
  }

  ngOnInit(): void {
    this.languageService.currentLanguage$.subscribe(language => {
      this.currentLanguage = language;
      // Add any additional actions you need to perform when language changes
    });

    this.listingService.getListingById(this.listingId).subscribe((listing: Listing) => {
      this.listing = listing;

      if (listing.owner.id === this.authService.getUserId()){
        this.ownership = true;
      }

      if (this.listing.owner.id != null) {
        this.userService.getUserById(Number(this.listing.owner.id)).subscribe((user: User) => {
          this.owner = user;
        })
      }


    }, e => {
      this.router.navigate(['/404']);
    });
    this.canApply = !this.authService.isProducer();
    this.currentLanguage = this.languageService.getLanguage();
  }

  editListing() {
    if (this.listingId !=-1) {
      this.router.navigate(['/listing/edit/'+this.listingId]);
    }
  }

}
