import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ListingService} from "../../services/listing.service";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {Listing} from "../../models/Listing";
import {User} from "../../models/User";
import {QualificationType, UserType} from "../../models/Enums";

@Component({
  selector: 'app-my-listings',
  templateUrl: './my-listings.component.html',
  styleUrl: './my-listings.component.css'
})
export class MyListingsComponent implements OnInit{

  user: User;
  listings: Listing[] = [];

  info = false;
  infoMessage = '';
  error = false;
  errorMessage = '';

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
        this.listings = result;
        console.log("Found Listings: ", result)
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




}
