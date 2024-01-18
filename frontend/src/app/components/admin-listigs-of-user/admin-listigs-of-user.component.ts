import {Component, Inject, InjectionToken, OnInit, ViewChild} from '@angular/core';
import {ListingService} from "../../services/listing.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {Listing} from "../../models/Listing";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {LanguageService} from "../../services/language.service";
import {EditListingComponent} from "../edit-listing/edit-listing.component";
import {DetailComponent} from "../listing-details/detail.component";


@Component({
  selector: 'app-admin-listigs-of-user',
  templateUrl: './admin-listigs-of-user.component.html',
  styleUrl: './admin-listigs-of-user.component.css'
})
export class AdminListigsOfUserComponent implements OnInit{

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

  deleteListing(listingId: number){
    return;
  }

}
