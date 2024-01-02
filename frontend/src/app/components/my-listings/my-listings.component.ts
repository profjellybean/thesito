import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ListingService} from "../../services/listing.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {Listing} from "../../models/Listing";
import {User} from "../../models/User";
import {QualificationType, UserType} from "../../models/Enums";
import {Tag} from "../../models/Tag";
import {instanceOf} from "graphql/jsutils/instanceOf";

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
      qualification: QualificationType.None,
      receiveEmails: true
    };
  }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.user.id = this.authService.getUserId();
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
          this.listings = this.listings.sort((a, b): number => {
            let n: number = -1;

            if (a.createdAt instanceof Date && b.createdAt instanceof Date){
              n = a.createdAt.getTime() - b.createdAt.getTime();
            }
            return n == -1 ? -1 : n;
          });
          this.listingsLoaded = true;
        },
        error: error =>{
          this.error = true;
          this.errorMessage = error.message;
        }
      })
    } else {
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 100);
    }

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
    let index = this.listings.indexOf(listing)
    listing = {
      ...listing,  // Copy existing properties
      active: !listing.active
    };
    this.listingService.updateListing(listing).subscribe({
      next: ret =>{
        this.listings[index] = listing;
      },
      error: error => {
        this.error= true;
        this.errorMessage = error.message;
      }
    });
  }

  goToListingDetailPage(id: string | undefined){
    this.router.navigate(['/listing/', id]);
  }

  goToCreateListing(){
    this.router.navigate(['/listing/create'])
  }

  isLoggedIn(): boolean{
    return this.authService.isLoggedIn();
  }

  isProducer(): boolean{
    return this.authService.isProducer();
  }
}
