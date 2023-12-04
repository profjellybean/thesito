import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Listing} from "../../models/Listing";
import {ListingService} from "../../services/listing.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {validate} from "graphql/validation";
import notEmpty = jasmine.notEmpty;
import {User} from "../../models/User";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent {
  listingId: number = -1;
  listing: Listing;
  applicationForm: FormGroup;
  userService: UserService;
  constructor(private route: ActivatedRoute, private listingService: ListingService, private router: Router, private formBuilder: FormBuilder,
              userService: UserService) {
    console.log('Called Constructor');
    this.userService = userService;
    this.route.params.subscribe(params => {
      this.listingId = params['id'];
    });
    if (this.listingId === -1) {
      console.log('No listing id provided');
      this.router.navigate(['/404']);
    } else {
     listingService.getListingById(this.listingId).subscribe((listing: Listing) => {
        this.listing = listing;
     }, e => {
       this.router.navigate(['/404']);
     });
      this.applicationForm = formBuilder.group({
        text: ['', Validators.required],
      })
    }
  }

  apply() {
    // @ts-ignore
    if (this.applicationForm.valid) {
      this.userService.getCurrentUser().subscribe((user: User) => {
        const text = this.applicationForm.get('text')?.value;
        if (this.listing?.id && user?.id) {
          this.listingService.applyToListing(parseInt(this.listing.id), user.id, text).subscribe((listing: Listing) => {
            this.listing = listing;
          });
        }
        })
      }
    }
}
