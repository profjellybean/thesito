import {Injectable} from '@angular/core';
import {Apollo} from "apollo-angular";
import {gql} from "@apollo/client/core";
import {LanguageService} from "./language.service";
import {getAllTagsQuery, getAllTagsShallowQuery, getTrendingTagsQuery, Tag} from "../models/Tag";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private apollo: Apollo, private translate: LanguageService) {
  }

  getAllTags(shallow: boolean) {
    if (shallow) {
      return this.apollo.query({
       query: getAllTagsShallowQuery
      })
    }
    return this.apollo.query({
      query: getAllTagsQuery
    })
  }

  getTrendingTags(): Observable<Tag[]> {
    return this.apollo.query<{ getTrendingTags: Tag[] }>({
      query: getTrendingTagsQuery
    })
      .pipe(
        map((result) => result.data.getTrendingTags)
      );
  }
}
