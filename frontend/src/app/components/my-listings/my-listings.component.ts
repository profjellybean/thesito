import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ListingService} from "../../services/listing.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {Listing} from "../../models/Listing";
import {User} from "../../models/User";
import {QualificationType, UserType} from "../../models/Enums";
import {Tag} from "../../models/Tag";

@Component({
  selector: 'app-my-listings',
  templateUrl: './my-listings.component.html',
  styleUrl: './my-listings.component.scss'
})
export class MyListingsComponent implements OnInit{

  user: User;
  listings: Listing[] = [];

  info = false;
  infoMessage = '';
  error = false;
  errorMessage = '';

  listingsLoaded = false;

  constructor(private router: Router,
              private listingService: ListingService,
              private authService: AuthService

  ) {
    this.user = {
      id: -1,
      email: "",
      name: "",
      password: "",
      userType: UserType.ListingConsumer,
      userTags: [],
      qualification: QualificationType.None
    };
  }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.user.id = this.authService.getUserId();
    } else {
      setTimeout(() => {
        this.router.navigate(['/404']);
      }, 100);
    }
    this.user.id = this.authService.getUserId()
    this.listingService.getAllListingsFromUserWithId(this.user.id).subscribe({
      next: result =>{
        let tempListings = result;
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
          let templisting = {
            id: listing.id,
            title: listing.title,
            details: listing.details,
            company: listing.company,
            university: listing.university,
            tags: tempTags,
            owner: listing.owner,
            active: listing.active,
            requirement: listing.requirement
          }
          this.listings.push(templisting);
        })
        console.log("Found Listings: ", result)
        this.listingsLoaded = true;
      },
      error: error =>{
        this.error = true;
        this.errorMessage = error.message;
      }
    })


  }

  vanishInfo(): void {
    this.info = false;
    this.infoMessage = '';
  }

  vanishError(): void {
    this.error = false;
    this.errorMessage = '';
  }

  toggleListingStatus(listing: Listing){
    listing = {
      ...listing,  // Copy existing properties
      active: !listing.active
    };
    this.listingService.updateListing(listing).subscribe({
      next: ret =>{
        console.log("Listing updated successfully! ", ret);
      },
      error: error => {
        this.error= true;
        this.errorMessage = error.message;
        console.log(this.errorMessage);
      }
    });
  }

}
