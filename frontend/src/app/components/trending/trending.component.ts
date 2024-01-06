import {Component, ViewChild} from "@angular/core";
import {ListingService} from "../../services/listing.service";
import {Tag} from "../../models/Tag";
import {MatChipListbox, MatChipListboxChange} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {Listing} from "../../models/Listing";
import {QualificationType} from "../../models/Enums";
import {Observable} from "rxjs";
import {Router} from "@angular/router";
import {TagService} from "../../services/tag.service";
import {LanguageService} from "../../services/language.service";

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css']
})

export class TrendingComponent {
  tagService: TagService;
  listingService: ListingService;
  languageService: LanguageService;
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
  @ViewChild('institutionTypeListbox') institutionTypeListbox: MatChipListbox;
  trendingTopics: Observable<Tag[]>;
  currentLanguage = 'en';

  constructor(
    listingService: ListingService,
    tagService: TagService,
    languageService: LanguageService,
    private router: Router
  ) {
    this.tagService = tagService;
    this.listingService = listingService;
    this.languageService = languageService;
  }

  ngOnInit(): void {
    this.loadPage(this.currentPage);
    this.allUniversities = this.listingService.getAllListingUniversities()
    this.allCompanies = this.listingService.getAllListingCompanies()
    this.languageService.currentLanguage$.subscribe((language) => {
      this.currentLanguage = language;
    });
  }

  performSearch(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.trendingTopics = this.tagService.getTrendingTags()
    this.currentPage = page
    this.fullTextSearchPattern = this.fullTextSearchPattern === '' ? null : this.fullTextSearchPattern;
    let formattedStartDate = this.convertDateToString(this.searchStartDate)
    let formattedEndDate = this.convertDateToString(this.searchEndDate)
    let university = this.institutionType === 'university' && this.searchUniversity ? this.searchUniversity : null
    let company = this.institutionType === 'company' && this.searchCompany ? this.searchCompany : null
    let tagIds = this.searchTags.map(tag => tag.id)
    const offset = (page - 1) * this.listingsPerPage;
    const limit = this.listingsPerPage;
    this.listingService.advancedSearch(this.fullTextSearchPattern, this.searchQualificationType, formattedStartDate,
      formattedEndDate, university, company, tagIds, offset, limit)
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

  onUniversitySelect($event: MatAutocompleteSelectedEvent) {
    this.performSearch();
  }

  onCompanySelect($event: MatAutocompleteSelectedEvent) {
    this.performSearch();
  }
}
