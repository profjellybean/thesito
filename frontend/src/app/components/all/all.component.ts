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

// TODO language toggle
export class AllComponent {
  listingService: ListingService;
  listings: Listing[] = [];
  currentPage: number = 1;
  listingsPerPage: number = 10;
  totalPages: number = 0;
  totalListings: number = 0;
  searchQualificationType: QualificationType | null = null;
  qualificationTypes: string[] = ["Any", ...Object.values(QualificationType)];
  isAdvancedSearch: boolean = false;
  searchStartDate: Date | null = null;
  searchEndDate: Date | null = null;
  fullTextSearchPattern: String | null = null
  pages: (number)[] = [];


  constructor(listingService: ListingService, private router: Router) {
    this.listingService = listingService;
  }

  ngOnInit(): void {
    this.loadPage(this.currentPage);
  }

  performSearch(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.currentPage = page
    this.fullTextSearchPattern = this.fullTextSearchPattern === '' ? null : this.fullTextSearchPattern;
    let formattedStartDate = this.convertDateToString(this.searchStartDate)
    let formattedEndDate = this.convertDateToString(this.searchEndDate)
    const offset = (page - 1) * this.listingsPerPage;
    const limit = this.listingsPerPage;

    this.listingService.advancedSearch(this.fullTextSearchPattern, this.searchQualificationType, formattedStartDate, formattedEndDate, offset, limit)
      .subscribe((searchResult) => {
        this.totalListings = searchResult.totalHitCount
        this.listings = searchResult.listings;
        this.totalPages = Math.ceil(this.totalListings / this.listingsPerPage);
      });
  }

  clearSearch() {
    this.fullTextSearchPattern = null;
    this.searchStartDate = null;
    this.searchEndDate = null;
    this.searchQualificationType = null;
    this.loadPage(1)
  }

  convertDateToString(date: Date | null): String | null {
    if (date) {
      return new Date(date).toISOString().split('T')[0];
    }
    return null
  }

  goToListing(id: string | undefined) {
    this.router.navigate(['/listing', id]);
  }
}
