import {Injectable} from "@angular/core";
import {Apollo} from "apollo-angular";
import {map, Observable} from "rxjs";
import {getAllListingsQuery, createListingQuery, Listing} from "../models/Listing";
@Injectable({
  providedIn: 'root',
})
export class ListingService {
  constructor(private apollo: Apollo) {}

  getAllListings(): Observable<Listing[]> {
    return this.apollo
      .query<{ getAllListings: Listing[] }>({
        query: getAllListingsQuery,
      })
      .pipe(
        map((result) => result.data.getAllListings)
      );
  }

  createListing(listing: Listing): Observable<any> {
    console.log(listing);
    return this.apollo.mutate<any>({
      mutation: createListingQuery,
      variables: {
        title: listing.title,
        details: listing.details,
        requirement: listing.requirement,
        tags: listing.tags,
        university: listing.university,
        company: listing.company,
      },
    });
  }
}
