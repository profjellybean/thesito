import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Listing} from "../../models/Listing";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {ApplicationDialogComponent} from "../application-dialog/application-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";
import {ListingService} from "../../services/listing.service";
import {User} from "../../models/User";

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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private listingService: ListingService,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.route.params.subscribe(params => {
      this.listingId = params['id'];
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


  }

  editListing() {
    if (this.listingId !=-1) {
      this.router.navigate(['/listing/edit/'+this.listingId]);
    }
  }
}
