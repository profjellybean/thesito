import { gql } from "@apollo/client/core";
import { Tag } from "./Tag";
export enum QualificationType {
  None = 0,
  Bachelors = 1,
  Masters = 2,
  PhD = 3,
}
export interface Listing {
  id?: string;
  title: string;
  details: string;
  requirement: QualificationType;
  tags?: Tag[];
  createdAt?: Date;
}

export const getAllListingsQuery = gql`
  query {
    getAllListings {
      id
      title
      details
      requirement
      createdAt
      tags {
        id
        title_de
        title_en
        layer
      }
    }
  }
`;

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
