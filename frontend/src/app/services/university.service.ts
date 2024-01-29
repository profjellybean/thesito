import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {gql} from "@apollo/client/core";
import {Apollo} from "apollo-angular";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root',
})
export class UniversityService {
  private readonly apiUrl = 'https://api.ror.org/organizations';

  constructor(private http: HttpClient, private apollo: Apollo) {
  }

  getUniversities(query: string): Observable<string[]> {
    const params = {query: query};
    return this.http.get<any>(this.apiUrl, {params: params})
      .pipe(
        map((response: { items: any[] }) => response.items.map(item => item.name)),
        catchError(() => {
          console.warn("Unable to fetch universities from ROR API. Falling back to local database.");
          return this.getAllListingUniversities(query);
        })
      );
  }

  /**
   * Returns a list of all universities belonging to listings in the database.
   */
  getAllListingUniversities(query: string | null = null): Observable<string[]> {
    return this.apollo
    .query<{ getAllListingUniversities: string[] }>({
      query: gql`
        query getAllListingUniversities($query: String) {
          getAllListingUniversities(query: $query)
        }
      `,
      variables: {
        query: query
      },
    })
    .pipe(
      map((result) => result.data.getAllListingUniversities)
    );
  }

}
