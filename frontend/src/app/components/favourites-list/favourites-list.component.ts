import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Listing } from '../../models/Listing';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-favourites-list',
  templateUrl: './favourites-list.component.html',
  styleUrls: ['./favourites-list.component.scss']
})
export class FavouritesListComponent implements OnInit {
  favourites: Listing[] = [];

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadFavourites();
  }

  loadFavourites(): void {
    this.userService.getFavouritesByUser().subscribe(favourites => {
      this.favourites = favourites;
    });
  }

  goToListing(id: string | undefined) {
    this.router.navigate(['/listing', id]);
  }

  removeFromFavorites(listingId: string | undefined): void {
    const removedListingIndex = this.favourites.findIndex(listing => listing.id === listingId);
    const removedListing = this.favourites.find(listing => listing.id === listingId);

    if (removedListingIndex !== -1) {
      this.favourites = this.favourites.filter(listing => listing.id !== listingId);

      const translatedMessage = this.translateService.instant('listingRemovedFromFavourites');
      const translatedUndo = this.translateService.instant('undo');

      const snackBarRef = this.snackBar.open(translatedMessage, translatedUndo, {
        duration: 5000,
      });

      snackBarRef.onAction().subscribe(() => {
        // Undo action
        if (removedListing) {
          this.userService.getCurrentUser().subscribe(user => {
            if (user?.id && listingId) {
              this.userService.toggleFavourite(user.id, listingId).subscribe(() => {
                // Add the listing back to its original position
                if (removedListingIndex <= this.favourites.length) {
                  this.favourites.splice(removedListingIndex, 0, removedListing);
                } else {
                  this.favourites.push(removedListing);
                }
              });
            }
          });
        }
      });
    }
  }
}
