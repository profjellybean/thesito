import { Injectable } from '@angular/core';
import {Apollo} from "apollo-angular";
import {Observable} from "rxjs";
import {createListingQuery, Listing} from "../models/Listing";

@Injectable({
  providedIn: 'root'
})
export class ListingService {

  constructor(private apollo: Apollo) {}

  createListing(listing: Listing): Observable<any> {
    console.log(listing)
    return this.apollo.mutate<any>({
      mutation: createListingQuery,
      variables: {
          title: listing.title,
          details: listing.details,
          requirement: listing.requirement
      },
    });
  }
}
