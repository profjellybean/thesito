import {gql} from "@apollo/client/core";

export interface Tag {
  id: number;
  layer: number;
  title_de: string;
  title_en: string;
}

export const getAllTagsShallowQuery = gql`
  query {
    getAllTagsShallow {
      id
      layer
      title_de
      title_en
    }
  }
`

export const getAllTagsQuery = gql`
  query {
    getAllTags {
      id
      layer
      title_de
      title_en
    }
  }
`
