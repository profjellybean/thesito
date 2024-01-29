import {Component, OnInit, ViewChild} from '@angular/core';
import {Listing} from "../../models/Listing";
import {ListingService} from "../../services/listing.service";
import {QualificationType} from "../../models/Enums";
import {Tag} from "../../models/Tag";
import {MatChipListbox, MatChipListboxChange} from "@angular/material/chips";
import {debounceTime, distinctUntilChanged, Observable, of, startWith, switchMap} from "rxjs";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {UniversityService} from "../../services/university.service";
import {FormControl} from "@angular/forms";
import { ActivatedRoute, Router, Params } from '@angular/router';
import { parse } from 'graphql';

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})


// TODO language toggle
export class AllComponent implements OnInit {
  listingService: ListingService;
  universityService: UniversityService;
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
  searchTags: string[] = [];
  institutionType = '';
  pages: (number)[] = [];
  allUniversities: Observable<string[]>;
  allCompanies: Observable<string[]>;
  searchUniversity: string = '';
  searchCompany: string = '';
  searchUniversityControl: FormControl = new FormControl();
  searchCompanyControl: FormControl = new FormControl();
  @ViewChild('institutionTypeListbox') institutionTypeListbox: MatChipListbox;

  constructor(
    listingService: ListingService,
    universityService: UniversityService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.listingService = listingService;
    this.universityService = universityService;
    this.activatedRoute.queryParams.subscribe((params: Params) => {
     this.currentPage = params['page'] ? parseInt(params['page']) : this.currentPage;
     this.fullTextSearchPattern = params['text'] ? params['text'] : this.fullTextSearchPattern;
     this.isAdvancedSearch = params['advancedSearch'] ? params['advancedSearch'] == 'true' : this.isAdvancedSearch;
     this.searchStartDate = params['startDate'] ? params['startDate'] : this.searchStartDate;
     this.searchEndDate = params['endDate'] ? params['endDate'] : this.searchEndDate;
     this.searchQualificationType = params['qualification'] ? params['qualification'] : this.searchQualificationType;
     this.searchTags = params['tags'] ? params['tags'] : this.searchTags;
     this.searchCompany = params['company'] ? params['company'] : this.searchCompany;
     this.searchUniversity = params['university'] ? params['university'] : this.searchUniversity;
      this.loadPage(this.currentPage);
    });
  }

  ngOnInit(): void {
    this.loadPage(this.currentPage);
    // this.allUniversities = this.universityService.getAllListingUniversities()
    this.searchUniversityControl.setValue(this.searchUniversity);
    this.searchUniversityControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        return this.universityService.getAllListingUniversities(value);
      })
    ).subscribe(value => this.allUniversities = of(value));
    this.searchCompanyControl.setValue(this.searchCompany);
    this.searchCompanyControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        return this.listingService.getAllListingCompanies(value);
      })
    ).subscribe(value => this.allCompanies = of(value));
  }

updateQueryParams(): void {
    const queryParams: Params = {
      page: this.currentPage,
      text: this.fullTextSearchPattern,
      advancedSearch: this.isAdvancedSearch,
      startDate: this.searchStartDate,
      endDate: this.searchEndDate,
      qualification: this.searchQualificationType,
      tags: this.searchTags,
      company: this.searchCompany,
      university: this.searchUniversity,
    };

    this.router.navigate([], {
      queryParams: queryParams,
      queryParamsHandling: 'merge', // use 'preserve' to keep existing parameters
    });
  }

  performSearch(): void {
    this.currentPage = 1;
    this.loadPage(1);
    this.updateQueryParams();
  }

  loadPage(page: number): void {
    this.currentPage = page
    this.updateQueryParams();
    this.fullTextSearchPattern = this.fullTextSearchPattern === '' ? null : this.fullTextSearchPattern;
    let formattedStartDate = this.convertDateToString(this.searchStartDate)
    let formattedEndDate = this.convertDateToString(this.searchEndDate)
    let university = this.institutionType === 'university' && this.searchUniversity ? this.searchUniversity : null
    let company = this.institutionType === 'company' && this.searchCompany ? this.searchCompany : null
    if (!Array.isArray(this.searchTags)){
      this.searchTags = [this.searchTags]
    }
    let tagIds = (this.searchTags).map(function(str) { return parseInt(str)})
    const offset = (page - 1) * this.listingsPerPage;
    const limit = this.listingsPerPage;
    this.listingService.advancedSearch(this.fullTextSearchPattern, this.searchQualificationType, formattedStartDate,
      formattedEndDate, university, company, tagIds, offset, limit, null, null)
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
    this.searchTags = [];
    this.searchUniversity = "";
    this.searchCompany = "";
    this.institutionType = "";
    this.setTags([])
    this.institutionTypeListbox.writeValue('')
    this.loadPage(1)
  }

  setTags(tags: Tag[]) {
    this.searchTags = tags.map(tag => tag.id.toString());
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

  onUniversitySelect($event: MatAutocompleteSelectedEvent) {
    this.searchUniversity = $event.option.value;
    this.performSearch();
  }

  onCompanySelect($event: MatAutocompleteSelectedEvent) {
    this.searchCompany = $event.option.value;
    this.performSearch();
  }

  toggleAdvancedSearch(){
    this.updateQueryParams();
  }
}
