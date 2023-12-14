import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Observable, startWith, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ListingService } from '../../services/listing.service';
import { UniversityService } from '../../services/university.service';
import { Tag } from "../../models/Tag";
import { Listing } from "../../models/Listing";
import { QualificationType, UserType } from "../../models/Enums";
import { TranslateService } from "@ngx-translate/core";
import { User } from "../../models/User";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";

@Component({
  selector: 'app-edit-listing',
  templateUrl: './edit-listing.component.html',
  styleUrls: ['./edit-listing.component.scss'],
})
export class EditListingComponent implements OnInit {
  error = false;
  errorMessage = '';
  router: Router;
  listing: Listing;
  listingService: ListingService;
  translateService: TranslateService;
  universityService: UniversityService;
  selectedTags: Tag[] = [];
  editListingForm: FormGroup;
  success = false;
  successMessage = '';
  filteredOptions: Observable<string[]> | undefined;
  user: User;
  listingId: number;
  tagsLoaded = false;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    private userService: UserService,
    listingService: ListingService,
    router: Router,
    universityService: UniversityService,
    translateService: TranslateService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.editListingForm = this.fb.group({
      shortTitle: ['', Validators.required],
      details: ['', Validators.required],
      requirement: ['', Validators.required],
      condition: ['', Validators.required],
      companyName: [''],
      otherCondition: [''],
      active: [false]
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
    this.userService.getCurrentUser().subscribe(
      (user) => {
        if (user) {
          this.listing.owner = user;
        } else {
          // Handle the case where the user is not defined
          console.error("User is undefined");
        }
      },
      (error) => {
        console.error(error);
      }
    );
    this.router = router;
    this.translateService = translateService;
    this.universityService = universityService;
    this.listingId = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.user.id = this.authService.getUserId();
    } else {
      setTimeout(() => {
        this.router.navigate(['/404']);
      }, 100);
    }

    const otherConditionControl = this.editListingForm.get('otherCondition');
    if (otherConditionControl) {
      this.filteredOptions = otherConditionControl.valueChanges.pipe(
        startWith(''),
        debounceTime(200), // debounce time in milliseconds
        distinctUntilChanged(),
        switchMap(value => this.universitySearch(value || 'university of vienna')) // Use the value or a default query of vienna
      );
    }

    this.listingService.getListingById(this.listingId).subscribe(
      (listingData) => {
        this.listing = listingData;
        this.editListingForm.patchValue({
          shortTitle: this.listing.title,
          details: this.listing.details,
          requirement: this.listing.requirement,
          condition: this.listing.university ? 'university' : 'company', // Assuming 'condition' is the form control for the mat-chip-listbox
          companyName: this.listing.company,
          otherCondition: this.listing.university || '',
          // ... other fields
          createdAt: this.listing.createdAt,
          university: this.listing.university,
          company: this.listing.company,
          owner: this.listing.owner, // Assuming 'owner' is an object with its own properties
          active: this.listing.active,
        });
        this.listing.tags?.forEach(tag=>{
          let t = {
            id: tag.id,
            layer: tag.layer,
            title_de: tag.title_de,
            title_en: tag.title_en
          }
          this.selectedTags.push(t)
        });
        this.tagsLoaded = true;
      },
      (error) => {
        console.error("Error loading listing data: ", error);
      }
    );
  }

  universitySearch(query: string): Observable<string[]> {
    return this.universityService.getUniversities(query).pipe(
      map((response: { items: any[] }) => response.items.map((item: any) => item.name)),
    );
  }
  setTags(tags: Tag[]) {
   this.selectedTags = tags;
  }

  toggleListingStatus(event: MatSlideToggleChange): void {
    this.editListingForm.patchValue({
      active: event.checked
    });
  }



  getQualificationTypes(): string[] {
    return Object.values(QualificationType).filter(value => typeof value === 'string') as string[];
  }

  updateListing() {
    if (this.editListingForm.valid && this.selectedTags.length > 0) {
      const shortTitle = this.editListingForm.get('shortTitle')?.value;
      const details = this.editListingForm.get('details')?.value;
      const requirement = this.editListingForm.get('requirement')?.value;
      const conditionValue = this.editListingForm.get('condition')?.value;
      let companyValue: string;
      let universityValue: string;

      if (conditionValue === 'company') {
        companyValue = this.editListingForm.get('companyName')?.value;

        const listing: Listing = {
          id: this.listing.id,
          title: shortTitle,
          details: details,
          requirement: requirement,
          tags: this.selectedTags,
          company: companyValue,
          owner: this.user,
          active: this.editListingForm.get('active')?.value
        };

        this.update(listing);
      } else {
        this.universityService.getUniversities(this.editListingForm.get('otherCondition')?.value).subscribe(
          (response: { items: any[] }) => {
            const universities = response.items.map((item: any) => item.name);
            const selectedUniversity = this.editListingForm.get('otherCondition')?.value;

            // Check if the selected university is in the list of options
            if (selectedUniversity && universities.includes(selectedUniversity)) {
              universityValue = selectedUniversity;

              // Proceed with updating the listing for other conditions
              const listing: Listing = {
                id: this.listing.id,
                title: shortTitle,
                details: details,
                requirement: requirement,
                tags: this.selectedTags,
                university: universityValue,
                owner: this.user,
                active: this.editListingForm.get('active')?.value
              };

              this.update(listing);
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



  private update(listing: Listing) {
    // Assume you have a function in your listingService to update the listing
    this.listingService.updateListing(listing).subscribe(
      (res: any) => {
        if (res.data?.updateListing != null) {
          this.success = true;
          this.error = false;
          this.errorMessage = ''; // Reset error message
          this.formatSuccessMessage('successUpdatingListing');
          setTimeout(() => {
            this.router.navigate([`/listing/${res.data.updateListing.id}`]);
          }, 1000);
        }
      },
      (error) => {
        this.formatErrorMessageWithError('errorUpdatingListing', error.message);
      }
    );
  }

  private formatErrorMessage(error: string): void {
    this.translateService.get(error).subscribe((res: string) => {
      this.errorMessage = res;
    }, e => {
      this.errorMessage = error;
    });
  }

  private formatErrorMessageWithError(errorKey: string, errorMessage: string): void {
    const translatedErrorKey = this.translateService.instant(errorKey);
    this.errorMessage = `${translatedErrorKey} ${errorMessage}`;
  }

  private formatSuccessMessage(success: string): void {
    this.translateService.get(success).subscribe((res: string) => {
      this.successMessage = res;
    }, e => {
      this.successMessage = success;
    });
  }


  protected readonly QualificationType = QualificationType;
}
