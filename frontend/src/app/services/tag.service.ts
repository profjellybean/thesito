import { Injectable } from '@angular/core';
import {Apollo} from "apollo-angular";
import {gql} from "@apollo/client/core";
import {LanguageService} from "./language.service";

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private apollo: Apollo, private translate: LanguageService) { }

  getAllTags() {
    let language = this.translate.getLanguage();
    if (language == 'de') {
      return this.apollo.query({
        query: gql`
          query {
            getAllTags {
              id
              layer
              title_de
            }
          }
        `
      })
    } else {
      return this.apollo.query({
        query: gql`
          query {
            getAllTags {
              id
              layer
              title_en
            }
          }
        `
      })
    }
  }
}
