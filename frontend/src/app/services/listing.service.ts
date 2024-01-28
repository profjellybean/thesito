import {Injectable} from "@angular/core";
import {Apollo} from "apollo-angular";
import {map, Observable} from "rxjs";
import {QualificationType} from "../models/Enums";
import {
  advancedSearchQuery, applyToListingQuery,
  createListingQuery,
  getAllListingsQuery,
  getListingByIdQuery, getTrendingListingsQuery,
  Listing,
  updateListingQuery
} from "../models/Listing";
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

  applyToListing(listingId: number, userId: number, text: number): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: applyToListingQuery,
      variables: {
        listingId: listingId,
        userId: userId,
        text: text
      },
    });
  }

  getListingById(id: number): Observable<Listing> {
    return this.apollo
      .query<{ getListingById: Listing }>({
        query: getListingByIdQuery,
        variables: {
          id: Number(id),
        },
      }).pipe(
        map((result) => result.data.getListingById)
      )
  }

  advancedSearch(textPattern: String | null, qualification: QualificationType | null, startDate: String | null,
                 endDate: String | null, university: String | null, company: String | null, tagIds: number[] | null,
  offset: number | null, limit: number | null, owner_id: number | null, non_active: boolean | null): Observable<SearchResult> {
    return this.apollo
      .query<{ advancedSearch: SearchResult }>({
        query: advancedSearchQuery,
        variables: {
          textPattern: textPattern,
          qualification: qualification,
          startDate: startDate,
          endDate: endDate,
          university: university,
          company: company,
          tagIds: tagIds,
          offset: offset,
          limit: limit,
          owner_id: owner_id,
          non_active: non_active
        }
      })
      .pipe(
        map((result) => result.data.advancedSearch)
      );
  }

  getTrendingListings(university: string | null, company: string | null, pageIndex: number | null, pageSize: number | null) {
    return this.apollo
      .query<{ getTrendingListings: SearchResult }>({
        query: getTrendingListingsQuery,
        variables: {
          university: university,
          company: company,
          pageIndex: pageIndex,
          pageSize: pageSize
        }
      })
      .pipe(
        map((result) => result.data.getTrendingListings)
      );
  }

  createListing(listing: Listing): Observable<any> {
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

  deleteListingById(id: number): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: gql`
      mutation DeleteListing($id: BigInteger!) {
        deleteListingById(id: $id)
      }
    `,
      variables: {
        id: id,
      },
    });
  }

  getAllListingCompanies(query: string | null = null): Observable<string[]> {
    return this.apollo
      .query<{ getAllListingCompanies: string[] }>({
        query: gql`
          query getAllListingCompanies($query: String){
            getAllListingCompanies(query: $query)
          }
        `,
        variables: {
          query: query
        },
      })
      .pipe(
        map((result) => result.data.getAllListingCompanies)
      );
  }

}
