import {Component} from '@angular/core';
import {Listing} from "../../models/Listing";
import {ListingService} from "../../services/listing.service";
import {QualificationType} from "../../models/Enums";
import {Router} from "@angular/router";

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})

export class AllComponent {
  listingService: ListingService;
  listings: Listing[] = [];
  currentPage: number = 1;
  listingsPerPage: number = 10;
  totalPages: number = 0;
  totalListings: number = 0;
  searchTitle: String = ""
  searchDetails: String = ""
  // TODO language toggle
  searchQualificationType: QualificationType | null = null;
  qualificationTypes: string[] = ["Any", ...Object.values(QualificationType)];

  constructor(listingService: ListingService, private router: Router) {
    this.listingService = listingService;
  }

  ngOnInit(): void {
    this.fetchTotalListingsCount();
    this.loadPage(this.currentPage);
  }

  performSearch(): void {
    this.fetchTotalListingsCount()
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.currentPage = page
    const offset = (page - 1) * this.listingsPerPage;
    const limit = this.listingsPerPage;
    this.listingService.simpleSearch(this.searchTitle, this.searchQualificationType, this.searchDetails, offset, limit)
      .subscribe((listings) => {
        this.listings = listings;
        console.log(listings)
      });
  }

 qualificationToString(q: QualificationType): string {
   switch (q) {
     case QualificationType.None:
       return 'qualificationNone';
     case QualificationType.Bachelors:
       return 'bachelors';
     case QualificationType.Masters:
       return 'masters';
     case QualificationType.PhD:
       return 'phd';
   }
 }

  fetchTotalListingsCount(): void {
    this.listingService.simpleSearchCount(this.searchTitle, this.searchQualificationType, this.searchDetails)
      .subscribe((count) => {
        this.totalListings = count;
        this.totalPages = Math.ceil(this.totalListings / this.listingsPerPage);
      });
  }

  goToListing(id: string | undefined) {
    this.router.navigate(['/listing', id]);
  }
}
