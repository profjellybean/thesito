import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged, Observable, startWith, switchMap} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {map} from 'rxjs/operators';
import {ListingService} from '../../services/listing.service';
import {UniversityService} from '../../services/university.service';
import {Tag} from "../../models/Tag";
import {Router} from "@angular/router";
import {Listing} from "../../models/Listing";
import {QualificationType, UserType} from "../../models/Enums";
import {TranslateService} from "@ngx-translate/core";
import {User} from "../../models/User";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.component.html',
  styleUrls: ['./create-listing.component.scss'],
})
export class CreateListingComponent implements OnInit {
  error = false;
  errorMessage = '';
  router: Router;
  listing: Listing;
  listingService: ListingService;
  translateService: TranslateService;
  universityService: UniversityService;
  selectedTags: Tag[] = [];
  createListingForm: FormGroup;
  success = false;
  successMessage = '';
  filteredOptions: Observable<string[]> | undefined;
  user: User;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;


  constructor(private userService: UserService, listingService: ListingService, private fb: FormBuilder, router: Router, translateService: TranslateService, universityService: UniversityService,
              private authService: AuthService) {
    this.createListingForm = this.fb.group({
      shortTitle: ['', Validators.required],
      details: ['', Validators.required],
      requirement: ['', Validators.required],
      condition: ['', Validators.required],
      companyName: [''],
      otherCondition: ['']
    });
    this.user = {
      id: -1,
      email: "",
      name: "",
      password: "",
      userType: UserType.ListingConsumer,
      userTags: [],
      qualification: QualificationType.None
    };
    this.listingService = listingService;
    this.listing = {
      title: "",
      details: "",
      requirement: QualificationType.None,
      owner: this.user
    };
    this.userService.getCurrentUser().subscribe((user) => {
      // @ts-ignore
      this.listing.owner = user.id;
    }, e =>
    {
      console.log(e)
    });
    this.router = router;
    this.translateService = translateService;
    this.universityService = universityService
  }


  ngOnInit() {
    if(this.authService.isLoggedIn()){
      this.user.id = this.authService.getUserId();
    } else {
      setTimeout(() => {
        this.router.navigate(['/404']);
      }, 100);
    }
    const otherConditionControl = this.createListingForm.get('otherCondition');
    if (otherConditionControl) {
      this.filteredOptions = otherConditionControl.valueChanges.pipe(
        startWith(''),
        debounceTime(200), // debounce time in milliseconds
        distinctUntilChanged(),
        switchMap(value => this.universitySearch(value || 'university of vienna')) // Use the value or a default query of vienna
      );
    }
  }


  universitySearch(query: string): Observable<string[]> {
    return this.universityService.getUniversities(query).pipe(
      map((response: { items: any[] }) => response.items.map((item: any) => item.name)),
    );
  }

  getQualificationTypes(): string[] {
    return Object.values(QualificationType).filter(value => typeof value === 'string') as string[];
  }

  setTags(tags: Tag[]) {
    this.selectedTags = tags;
    console.log(this.selectedTags);
  }


  createListing() {
    if (this.createListingForm.valid && this.selectedTags.length > 0) {
      const shortTitle = this.createListingForm.get('shortTitle')?.value;
      const details = this.createListingForm.get('details')?.value;
      const requirement = this.createListingForm.get('requirement')?.value;
      const conditionValue = this.createListingForm.get('condition')?.value;
      let companyValue: string;
      let universityValue: string;

      if (conditionValue === 'company') {
        companyValue = this.createListingForm.get('companyName')?.value;

        const listing: Listing = {
          title: shortTitle,
          details: details,
          requirement: requirement,
          tags: this.selectedTags,
          company: companyValue,
          owner: this.user,
          active: true
        };
        this.create(listing);
      } else {
        this.universityService.getUniversities(this.createListingForm.get('otherCondition')?.value).subscribe(
          (response: { items: any[] }) => {
            const universities = response.items.map((item: any) => item.name);
            const selectedUniversity = this.createListingForm.get('otherCondition')?.value;

            // Check if the selected university is in the list of options
            if (selectedUniversity && universities.includes(selectedUniversity)) {
              universityValue = selectedUniversity;

              // Proceed with creating the listing for other conditions
              const listing: Listing = {
                title: shortTitle,
                details: details,
                requirement: requirement,
                tags: this.selectedTags,
                university: universityValue,
                owner: this.user,
                active: true
              };
              this.create(listing)
            } else {
              this.formatErrorMessage('invalidUniversitySelection');
            }
          },
        );
      }
    } else {
      this.formatErrorMessage('invalidListingInput');
    }
  }

  private create(listing: Listing) {
    console.log(listing.tags)
    this.listingService.createListing(listing).subscribe(
      (res: any) => {
        if (res.data?.createListing != null) {
          this.success = true;
          this.error = false;
          this.errorMessage = ''; // Reset error message
          this.formatSuccessMessage('successCreatingListing');
          setTimeout(() => {
            this.router.navigate([`/user/listings`]);
          }, 1000);
        }
      },
      (error) => {
        this.formatErrorMessageWithError('errorCreatingListing ', error.message);
      }
    );
  }

  private formatErrorMessageWithError(errorKey: string, errorMessage: string): void {
    const translatedErrorKey = this.translateService.instant(errorKey);
    this.errorMessage = `${translatedErrorKey} ${errorMessage}`;
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
}
