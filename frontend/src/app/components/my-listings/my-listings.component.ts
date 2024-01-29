import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Listing} from "../../models/Listing";
import {ListingService} from "../../services/listing.service";
import {Router} from "@angular/router";
import {Tag} from "../../models/Tag";
import {MatChipListbox, MatChipListboxChange} from "@angular/material/chips";
import {debounceTime, distinctUntilChanged, Observable, of, startWith, switchMap} from "rxjs";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {FormControl} from "@angular/forms";
import {QualificationType, UserType} from "../../models/Enums";
import {User} from "../../models/User";
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-my-listings',
  templateUrl: './my-listings.component.html',
  styleUrl: './my-listings.component.scss'
})


// TODO language toggle
export class MyListingsComponent implements OnInit {
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
  searchTags: Tag[] = [];
  institutionType = '';
  pages: (number)[] = [];
  allUniversities: Observable<string[]>;
  allCompanies: Observable<string[]>;
  searchUniversity: string = '';
  searchCompany: string = '';
  searchUniversityControl: FormControl = new FormControl();
  searchCompanyControl: FormControl = new FormControl();
  user_id: number = -1;
  @ViewChild('institutionTypeListbox') institutionTypeListbox: MatChipListbox;
  @Input() isStandalone: boolean = true;

  error = false;
  errorMessage = '';

  constructor(
    listingService: ListingService,
    private authService: AuthService,
    public router: Router
  ) {
    this.listingService = listingService;
    this.user_id = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.loadPage(this.currentPage);
  }

  performSearch(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.currentPage = page
    const offset = (page - 1) * this.listingsPerPage;
    const limit = this.listingsPerPage;
    this.user_id = this.authService.getUserId();
    this.fullTextSearchPattern = this.fullTextSearchPattern === '' ? null : this.fullTextSearchPattern;
    this.listingService.advancedSearch(this.fullTextSearchPattern, null, null,
      null, null, null, null, offset, limit, this.user_id, true)
      .subscribe((searchResult) => {
        this.totalListings = searchResult.totalHitCount
        this.totalPages = Math.ceil(this.totalListings / this.listingsPerPage);

        this.listings = []
        let tempListings = searchResult.listings;
        tempListings.forEach(listing =>{
          let tempTags: Tag[] = [];
          listing.tags?.forEach(tag =>{
            let t = {
              id: tag.id,
              layer: tag.layer,
              title_de: tag.title_de,
              title_en: tag.title_en
            }
            tempTags.push(t);

          })
          if (listing.createdAt){
            let templisting = {
              id: listing.id,
              title: listing.title,
              details: listing.details,
              company: listing.company,
              university: listing.university,
              tags: tempTags,
              owner: listing.owner,
              active: listing.active,
              requirement: listing.requirement,
              createdAt: new Date(listing.createdAt)
            }
            this.listings.push(templisting);
          }

        })


      });
  }

  clearSearch() {
    this.loadPage(1)
  }

  setTags(tags: Tag[]) {
    this.searchTags = tags;
    this.performSearch();
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

  onInstitutionTypeChange(event: MatChipListboxChange) {
    this.institutionType = event.value;
    this.performSearch();
  }

  onCompanySelect($event: MatAutocompleteSelectedEvent) {
    this.searchCompany = $event.option.value;
    this.performSearch();
  }

  toggleListingStatus(listing: Listing){
   // let index = this.listings.indexOf(listing)
   // listing = {
   //   ...listing,  // Copy existing properties
   //   active: !listing.active
   // };
    listing.active = !listing.active;
    this.listingService.updateListing(listing).subscribe({
      next: ret =>{
        //this.listings[index] = listing;
        //
        this.loadPage(this.currentPage)

      },
      error: error => {
        this.error= true;
        this.errorMessage = error.message;
      }
    });
  }

  goToCreateListing(){
    this.router.navigate(['/listing/create'])
  }
}
