import {Component, Inject, InjectionToken, OnInit, ViewChild} from '@angular/core';
import {ListingService} from "../../services/listing.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Listing} from "../../models/Listing";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {LanguageService} from "../../services/language.service";
import {EditListingComponent} from "../edit-listing/edit-listing.component";
import {DetailComponent} from "../listing-details/detail.component";
import {
  DeleteConfirmationDialogComponent
} from "../delete-confirmation-dialog-listing/delete-confirmation-dialog.component";
import {User} from "../../models/User";
import {
  DeleteConfirmationDialogUserComponent
} from "../delete-confirmation-dialog-user/delete-confirmation-dialog-user.component";
import {TranslateService} from "@ngx-translate/core";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-admin-listigs-of-user',
  templateUrl: './admin-listings-of-user.component.html',
  styleUrl: './admin-listings-of-user.component.css'
})
export class AdminListingsOfUserComponent implements OnInit{

  listings: Listing[];
  listingsLoaded: boolean =  false;

  info = false;
  infoMessage = '';
  error = false;
  errorMessage = '';

  displayedColumns: string[] = ['id', 'title', 'requirement', 'tags', 'createdAt', 'active']

  dataSource: MatTableDataSource<Listing>;

  @ViewChild(MatPaginator, {static:false}) paginator: MatPaginator;

  constructor(
    private listingService: ListingService,
    private router: Router,
    private translateService: TranslateService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number },
    protected languageService: LanguageService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()){
      this.listingService.getAllListingsFromUserWithId(this.data.userId).subscribe({
        next: result => {
          this.listings = [...result];
          this.listings = this.listings.sort((a, b): number => {
            if(a.id && b.id){
              let n = Number(a.id) - Number(b.id);
              return n;
            }else{
              return -1;
            }
          });

          this.dataSource = new MatTableDataSource<Listing>(this.listings);
          setTimeout(() => this.dataSource.paginator = this.paginator);
          this.listingsLoaded = true;
        },
        error: err => {
          this.error = true;
          this.errorMessage = err.message;
        }
      });
  }else{
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 100);
    }
  }
  openEditListingDialog(listingId: number): void {
    const dialogRef = this.dialog.open(EditListingComponent, {
    width: '90%',
    height: '80%',
    data: { listingId: listingId},
  });}

  openListingDetailsDialog(listingId: number): void {
    const dialogRef = this.dialog.open(DetailComponent, {
      width: '90%',
      height: '80%',
      data: { listingId: listingId},
    });}


  deleteListing(listing: Listing): void {
    let dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>;

    dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      data: { title: listing?.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.listingService.deleteListingById(Number(listing?.id)).subscribe({
          next: () => {
            this.showSuccessMessage();
            this.dataSource.data = this.dataSource.data.filter(u => u.id !== listing.id);
            // Reload the page after successful deletion
            //set 2s timeout to wait for the snackbar to disappear
            setTimeout(() => location.reload(), 2000);
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

}
