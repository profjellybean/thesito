import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable, startWith} from 'rxjs';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {map} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {TagService} from '../../services/tag.service';
import {ListingService} from '../../services/listing.service';
import { LanguageService } from '../../services/language.service';
import {Tag} from "../../models/Tag";
import {Router} from "@angular/router";
import {Listing, QualificationType} from "../../models/Listing";

@Component({
  selector: 'app-create-listing',
  templateUrl: './create-listing.component.html',
  styleUrls: ['./create-listing.component.scss'],
})
export class CreateListingComponent implements OnInit {
  error = false;
  router: Router;
  listing:Listing;
  listingService: ListingService;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new FormControl();
  filteredTags: Observable<string[]>;
  languageService: LanguageService;
  selectedTags: string[] = [];
  allTags: string[] = []; // Initialize to an empty array
  createListingForm: FormGroup;
  success = false;
  successMessage = '';

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;

  constructor(listingService: ListingService, private tagService: TagService, private fb: FormBuilder, router: Router, languageService: LanguageService) {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag !== null ? this._filter(tag) : this.allTags.slice())),
    );
    this.createListingForm = this.fb.group({
      shortTitle: ['', Validators.required],
      details: ['', Validators.required],
      requirement: ['None', Validators.required], // Set a default value or adjust as needed
    });
    this.listingService = listingService;
    this.listing = {
      title: "",
      details: "",
      requirement: QualificationType.None,
      /*topicTags: {
        id: -1,
        layer: -1
      } // Empty array provided here*/
    };
    this.router = router;
    this.languageService = languageService;
  }



  ngOnInit() {
    // Call the getAllTags method from TagService
    this.tagService.getAllTags().subscribe(
      (result: any) => {

        console.log(result); // Log the result to see what data is being returned

        if (result.data && result.data.getAllTags && Array.isArray(result.data.getAllTags)) {

          this.allTags = result.data.getAllTags.map((tag: Tag) => this.getTagTitles(tag));
        } else {
          console.error('Invalid data structure for tags:', result);
        }

        // Notify the filteredTags observable about the changes
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map((tag: string | null) => (tag !== null ? this._filter(tag) : this.allTags.slice())),
        );
      },
      (error) => {
        console.error('Error fetching tags:', error);
      }
    );
  }

  getTagTitles(tag: Tag): string {
    return this.languageService.loadLanguage() === 'en' ? tag.title_en : tag.title_de;
  }


  getQualificationTypes(): string[] {
    return Object.values(QualificationType).filter(value => typeof value === 'string') as string[];
  }

  remove(tag: string): void {
    const index = this.selectedTags.indexOf(tag);

    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;

    if (value && !this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }

    // Clear the input value
    this.tagInput!.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value ? value.toLowerCase() : '';

    return this.allTags.filter(
      (tag) => tag && tag.toLowerCase().includes(filterValue) && !this.selectedTags.includes(tag)
    );
  }


  createListing() {
    if (this.createListingForm.valid) {
      const shortTitle = this.createListingForm.get('shortTitle')?.value;
      const details = this.createListingForm.get('details')?.value;
      const requirement = this.createListingForm.get('requirement')?.value;

      // Convert selectedTags (array of strings) to an array of Tag objects
      const topicTags: {
        id: 1;
        layer: 1
        title_de: string;
        title_en: string;
      }[] = this.selectedTags.map((tagTitle: string) => {
        return {
          id: 1,
          layer: 1, // Set an appropriate default value
          title_en: tagTitle,
          title_de: tagTitle, // Assuming the same title for both languages
        };
      });

      const listing: Listing = {
        title: shortTitle,
        details: details,
        requirement: requirement,
      };

      console.log(listing);

      this.listingService.createListing(listing).subscribe(
        (res: any) => {
          if (res.data != null && res.data.createListing != null) {
            console.log(res.data);
            this.success = true;
            this.successMessage = 'Listing created successfully';
            setTimeout(() => {
              // Navigate to the listing details page or another appropriate route
              this.router.navigate([`/listing/${res.data.createListing.id}`]);
            }, 4000);
          }
        },
        (error) => {
          if (error != null) {
            this.error = true;
          }
        }
      );
    }
  }
}
