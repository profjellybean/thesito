import {Injectable} from "@angular/core";
import {Apollo} from "apollo-angular";
import {map, Observable} from "rxjs";
import {QualificationType} from "../models/Enums";
import {
  advancedSearchQuery,
  createListingQuery, fullTextSearchQuery,
  getAllListingsQuery,
  getAllListingsQueryPaginated,
  Listing,
  simpleSearchTitleOnlyQuery, updateListingQuery
} from "../models/Listing";
import {updateUserQuery, User} from "../models/User";
import {gql} from "@apollo/client/core";


interface SearchResult {
  totalHitCount: number;
  listings: Listing[];
}


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

  simpleSearch(title: String, qualification: QualificationType | null, details: String, offset: number, limit: number): Observable<SearchResult> {
    return this.apollo
      .query<{ simpleSearch: SearchResult }>({
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

  fullTextSearch(pattern: String, offset: number, limit: number): Observable<SearchResult> {
    return this.apollo
      .query<{ fullTextSearch: SearchResult }>({
        query: fullTextSearchQuery,
        variables: {
          pattern: pattern,
          offset: offset,
          limit: limit,
        }
      })
      .pipe(
        map((result) => result.data.fullTextSearch)
      );
  }

  advancedSearch(textPattern: String | null, qualification: QualificationType | null, startDate: String | null, endDate: String | null, offset: number | null, limit: number | null): Observable<SearchResult> {
    return this.apollo
      .query<{ advancedSearch: SearchResult }>({
        query: advancedSearchQuery,
        variables: {
          textPattern: textPattern,
          qualification: qualification,
          startDate: startDate,
          endDate: endDate,
          offset: offset,
          limit: limit
        }
      })
      .pipe(
        map((result) => result.data.advancedSearch)
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
        ownerId: listing.owner?.id,
        active: listing.active
      },
    });
  }

  getAllListingsFromUserWithId(id: number): Observable<Listing[]> {
    return this.apollo
      .query<{ getAllListingsFromUserWithId: Listing[] }>({
        query: gql`
          query getAllListingsFromUserWithId($id: BigInteger!){
            getAllListingsFromUserWithId(id: $id) {
              active
              company
              createdAt
              details
              id
              requirement
              title
              university
              tags {
                layer
                title_de
                title_en
                id
              }
              owner {
                id
              }
            }
          }
        `,
        variables: {
          id: Number(id),
        },
      })
      .pipe(
        map((result) => result.data.getAllListingsFromUserWithId)
      );
  }

  updateListing(listing: Listing): Observable<any> {
    console.log('Listing to update: ', listing)
    return this.apollo.mutate<any>({
      mutation: updateListingQuery,
      variables: {
        id: Number(listing.id),
        owner_id: Number(listing.owner.id),
        active: listing.active,
        title: listing.title,
        company: listing.company,
        university: listing.university,
        details: listing.details,
        tags: listing.tags,
        requirement: listing.requirement
      },
    });
  }
}
