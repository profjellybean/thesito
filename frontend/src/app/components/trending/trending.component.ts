import {Component, Input, ViewChild} from "@angular/core";
import {ListingService} from "../../services/listing.service";
import {Tag} from "../../models/Tag";
import {MatChipListbox, MatChipListboxChange} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {Listing} from "../../models/Listing";
import {QualificationType} from "../../models/Enums";
import {Observable, filter} from "rxjs";
import {Router} from "@angular/router";
import {TagService} from "../../services/tag.service";
import {LanguageService} from "../../services/language.service";
import {UniversityService} from "../../services/university.service";

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',
  styleUrls: ['./trending.component.css']
})

export class TrendingComponent {
  tagService: TagService;
  listingService: ListingService;
  languageService: LanguageService;
  universityService: UniversityService;
  trendingListings: Listing[] = [];
  currentPage: number = 1;
  listingsPerPage: number = 10;
  totalPages: number = 0;
  totalTrendingListings: number = 0;
  searchQualificationType: QualificationType | null = null;
  qualificationTypes: string[] = ["Any", ...Object.values(QualificationType)];
  isAdvancedSearch: boolean = false;
  fullTextSearchPattern: String | null = null
  institutionType = '';
  pages: (number)[] = [];
  allUniversities: Observable<string[]>;
  allCompanies: Observable<string[]>;
  searchUniversity: string = '';
  searchCompany: string = '';
  @ViewChild('institutionTypeListbox') institutionTypeListbox: MatChipListbox;
  trendingTopics: Observable<Tag[]>;
  currentLanguage = 'en';
  totalListings: number = 0;
  listings: Listing[] = [];
  searchTags: Tag[] = [];
  selectedTag: any = null;

  @Input() isStandalone: boolean = true;

  constructor(
    listingService: ListingService,
    tagService: TagService,
    languageService: LanguageService,
    public router: Router,
    universityService: UniversityService
  ) {
    this.tagService = tagService;
    this.listingService = listingService;
    this.languageService = languageService;
    this.universityService = universityService;
  }

  ngOnInit(): void {
    this.loadPage(this.currentPage);
    this.allUniversities = this.universityService.getAllListingUniversities()
    this.allCompanies = this.listingService.getAllListingCompanies()
    this.languageService.currentLanguage$.subscribe((language) => {
      this.currentLanguage = language;
    });
  }

  loadTrendingListings(page: number): void {
    this.selectedTag = null;
    this.loadPage(page);
  }

  loadPage(page: number): void {
    //this.selectedTag = null;
    this.trendingTopics = this.tagService.getTrendingTags()
    this.currentPage = page
    if (this.selectedTag != null){
      this.filterTag(page)
      return;
    }

    this.fullTextSearchPattern = this.fullTextSearchPattern === '' ? null : this.fullTextSearchPattern;
    let university = this.institutionType === 'university' && this.searchUniversity ? this.searchUniversity : null
    let company = this.institutionType === 'company' && this.searchCompany ? this.searchCompany : null
    const pageSize = this.listingsPerPage;
    this.listingService.getTrendingListings(university, company, page-1, pageSize)
      .subscribe((searchResult) => {
        this.totalTrendingListings = searchResult.totalHitCount
        this.listings = searchResult.listings;
        this.totalPages = Math.ceil(this.totalTrendingListings / this.listingsPerPage);
      });
  }

  goToListing(id: string | undefined) {
    this.router.navigate(['/listing', id]).then(() => {});
  }

  onInstitutionTypeChange(event: MatChipListboxChange) {
    this.institutionType = event.value;
    this.loadPage(1);
  }

  onUniversitySelect($event: MatAutocompleteSelectedEvent) {
    this.loadPage(1);
  }

  onCompanySelect($event: MatAutocompleteSelectedEvent) {
    this.loadPage(1);
  }

  filterTag(page: number): void {
    let tag = this.selectedTag;
    //this.selectedTag = tag.id;
    const offset = (page - 1) * this.listingsPerPage;
    const limit = this.listingsPerPage;
    let tagIds = [tag]

    this.listingService.advancedSearch(null, null, null,
      null,  null, null, tagIds, offset, limit, null, null)
      .subscribe((searchResult) => {
        this.totalListings = searchResult.totalHitCount
        this.listings = searchResult.listings;
        this.totalPages = Math.ceil(this.totalListings / this.listingsPerPage);
      });
  }

  selectTag(tag: any): void {
    this.selectedTag = tag.id;
    this.currentPage = 1;
    this.filterTag(1)
  }

  unselectTag(): void {
    this.selectedTag = null;
    this.loadPage(1)
  }

  isNoTagSelected(): boolean{
    return this.selectedTag == null;

  }

  isSelected(tag: any): boolean {
    return this.selectedTag == tag.id
  }
}
