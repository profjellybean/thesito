import {Injectable} from '@angular/core';
import {Apollo} from "apollo-angular";
import {gql} from "@apollo/client/core";
import {LanguageService} from "./language.service";
import {getAllTagsQuery, getAllTagsShallowQuery, getTrendingTagsQuery} from "../models/Tag";

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

  getTrendingTags() {
    return this.apollo.query({
      query: getTrendingTagsQuery
    })
  }
}
