import {QualificationType} from "./Enums";
import { gql } from "@apollo/client/core";
import { Tag } from "./Tag";
import {User} from "./User";


export interface Listing {
  id?: string;
  title: string;
  details: string;
  requirement: QualificationType;
  tags?: Tag[];
  createdAt?: Date;
  university?: string;
  company?: string;
  owner: User;
  active?: Boolean;
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
      owner {
        id
      }
    }
  }
`;

export const applyToListingQuery = gql`
  mutation ApplyToListing($listingId: BigInteger!, $userId: BigInteger!, $text: String!) {
    applyToListing(listingId: $listingId, userId: $userId, applicationText: $text)
  }
`;
export const getListingByIdQuery = gql`
  query ($id: BigInteger!) {
    getListingById(id: $id) {
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
      owner {
        id
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
      owner {
        id
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
        owner {
          id
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
        owner {
          id
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
        owner {
          id
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
    $active: Boolean
    $ownerId: BigInteger
  ) {
    createListing(
      listing: {
        title: $title
        details: $details
        requirement: $requirement
        tags: $tags
        university: $university
        company: $company
        active: $active
        owner: {
          id: $ownerId
        }
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
      owner {
        id
      }
    }
  }
`;

export const updateListingQuery = gql`
    mutation UpdateListing(
    $id: BigInteger!,
    $owner_id: BigInteger!,
    $active: Boolean!,
    $title: String!,
    $company: String,
    $university: String,
    $details: String!,
    $tags: [TagInput]!,
    $requirement: Qualification!)
    {
        updateListing(
            listing: {
                id: $id
                active: $active
                title: $title
                company: $company
                university: $university
                details: $details
                requirement: $requirement
                tags: $tags
                owner: {
                  id: $owner_id
                }
            }
        )
        {
        active
        company
        createdAt
        details
        id
        requirement
        title
        university
        owner {
            id
        }
        tags {
            layer
            title_de
            title_en
            id
        }
        }
    }
`;

