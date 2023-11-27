import { gql } from "@apollo/client/core";
import { Tag } from "./Tag";
export enum QualificationType {
  None = 0,
  Bachelors = 1,
  Masters = 2,
  PhD = 3,

}
export interface Listing {
  title: string;
  details: string;
  requirement: QualificationType;
  topicTags?: Tag[];
}
export const createListingQuery = gql`
mutation CreateListing($title: String!, $details: String!, $requirement: Qualification!) {
  createListing(
    listing: {
      title: $title
      details: $details
      requirement: $requirement
    }
  ) {
    title
    details
    requirement
  }
}

`;
