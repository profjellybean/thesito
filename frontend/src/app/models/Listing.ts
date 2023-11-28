import { gql } from "@apollo/client/core";
import { Tag } from "./Tag";
export enum QualificationType {
  "None",
  "Bachelors",
  "Masters",
  "PhD"
}
export interface Listing {
  title: string;
  details: string;
  requirement: QualificationType;
  tags?: Tag[];
}
export const createListingQuery = gql`
mutation CreateListing($title: String!, $details: String!, $requirement: Qualification!, $tags: [TagInput]) {
  createListing(
    listing: {
      title: $title
      details: $details
      requirement: $requirement
      tags: $tags
    }
  ) {
    title
    details
    requirement
    tags {
      id
      layer
      title_de
      title_en
    }
  }
}

`;
