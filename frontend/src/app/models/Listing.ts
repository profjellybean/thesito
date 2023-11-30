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

export const simpleSearchTitleOnlyQuery = gql`
  query ($title: String!, $qualificationType: Qualification, $details: String!, $offset: Int!, $limit: Int!) {
    simpleSearch (
      title: $title
      details: $details
      qualificationType: $qualificationType
      offset: $offset
      limit: $limit

    ){
      totalHitCount
      listings {
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
  }
`;

export const fullTextSearchQuery = gql`
  query ($pattern: String!, $offset: Int!, $limit: Int!) {
    fullTextSearch (
      pattern: $pattern
      offset: $offset
      limit: $limit
    ){
      totalHitCount
      listings {
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
  }
`;

export const advancedSearchQuery = gql`
  query ($textPattern: String, $qualification: Qualification, $startDate: String, $endDate: String, $offset: Int, $limit: Int) {
    advancedSearch (
      textPattern: $textPattern
      startDate: $startDate
      endDate: $endDate
      qualification: $qualification
      offset: $offset
      limit: $limit
    ){
      totalHitCount
      listings {
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
