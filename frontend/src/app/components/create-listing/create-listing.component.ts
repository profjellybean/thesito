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
import {Listing} from "../../models/Listing";
import {QualificationType} from "../../models/Enums";

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
  languageService: LanguageService;
  selectedTags: Tag[] = [];
  createListingForm: FormGroup;
  success = false;
  successMessage = '';

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;

  constructor(listingService: ListingService, private tagService: TagService, private fb: FormBuilder, router: Router, languageService: LanguageService) {
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
    };
    this.router = router;
    this.languageService = languageService;
  }

  ngOnInit() {
  }

  getQualificationTypes(): string[] {
    return Object.values(QualificationType).filter(value => typeof value === 'string') as string[];
  }

  setTags(tags: Tag[]) {
    this.selectedTags = tags;
  }


  createListing() {
    if (this.createListingForm.valid) {
      const shortTitle = this.createListingForm.get('shortTitle')?.value;
      const details = this.createListingForm.get('details')?.value;
      const requirement = this.createListingForm.get('requirement')?.value;

      const listing: Listing = {
        title: shortTitle,
        details: details,
        requirement: requirement,
        tags: this.selectedTags,
      };


      this.listingService.createListing(listing).subscribe(
        (res: any) => {
          if (res.data != null && res.data.createListing != null) {
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
