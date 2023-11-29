import {Injectable} from "@angular/core";
import {Apollo} from "apollo-angular";
import {map, Observable} from "rxjs";
import {QualificationType} from "../models/Enums";
import {
  createListingQuery,
  getAllListingsQuery,
  getAllListingsQueryPaginated,
  getTotalListingsCountQuery,
  Listing,
  simpleSearchCountQuery,
  simpleSearchTitleOnlyQuery
} from "../models/Listing";


const Qualification = {
  None: "None",
}

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

  getAllListingsPaginated(offset: number, limit: number): Observable<Listing[]> {
    return this.apollo
      .query<{ getAllListingsPaginated: Listing[] }>({
        query: getAllListingsQueryPaginated,
        variables: {
          offset: offset,
          limit: limit
        }
      })
      .pipe(
        map((result) => result.data.getAllListingsPaginated)
      );
  }

  getTotalListingsCount(): Observable<number> {
    return this.apollo
      .query<{ getTotalListingsCount: number }>({
        query: getTotalListingsCountQuery
      })
      .pipe(
        map((result) => result.data.getTotalListingsCount)
      );
  }

  simpleSearchCount(title: String, qualification: QualificationType | null, details: String): Observable<number> {
    return this.apollo
      .query<{ simpleSearchCount: number }>({
        query: simpleSearchCountQuery,
        variables: {
          title: title,
          qualificationType: qualification,
          details: details,
        }
      })
      .pipe(
        map((result) => result.data.simpleSearchCount)
      );
  }

  simpleSearch(title: String, qualification: QualificationType | null, details: String, offset: number, limit: number): Observable<Listing[]> {
    return this.apollo
      .query<{ simpleSearch: Listing[] }>({
        query: simpleSearchTitleOnlyQuery,
        variables: {
          title: title,
          qualificationType: qualification,
          details: details,
          offset: offset,
          limit: limit
        }
      })
      .pipe(
        map((result) => result.data.simpleSearch)
      );
  }

  createListing(listing: Listing): Observable<any> {
    console.log(listing)
    return this.apollo.mutate<any>({
      mutation: createListingQuery,
      variables: {
        title: listing.title,
        details: listing.details,
        requirement: listing.requirement,
        tags: listing.tags
      },
    });
  }
}
