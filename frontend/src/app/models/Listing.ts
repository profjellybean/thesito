import {QualificationType} from "./Enums";
import { gql } from "@apollo/client/core";
import { Tag } from "./Tag";


export interface Listing {
  id?: string;
  title: string;
  details: string;
  requirement: QualificationType;
  tags?: Tag[];
  createdAt?: Date;
  university?: string;
  company?: string;
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

export const getAllListingsQueryPaginated = gql`
  query get ($offset: Int!, $limit: Int!) {
    getAllListingsPaginated(
      offset: $offset
      limit: $limit
     ){
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

export const getTotalListingsCountQuery = gql`
  query {
    getTotalListingsCount
  }
`;
export const simpleSearchCountQuery = gql`
  query c ($title: String!) {
    simpleSearchCount (title: $title)
  }
`;

export const simpleSearchTitleOnlyQuery = gql`
  query ($title: String!, $qualificationType: Qualification, $details: String!, $offset: Int!, $limit: Int!) {
    simpleSearch (
      title: $title
      details: $details
      qualificationType: $qualificationType
      offset: $offset
      limit: $limit
    ){
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
  mutation CreateListing(
    $title: String!
    $details: String!
    $requirement: Qualification!
    $tags: [TagInput]
    $university: String
    $company: String
  ) {
    createListing(
      listing: {
        title: $title
        details: $details
        requirement: $requirement
        tags: $tags
        university: $university
        company: $company
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
      university
      company
    }
  }
`;
