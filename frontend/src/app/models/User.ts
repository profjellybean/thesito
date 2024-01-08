import {gql} from "@apollo/client/core";
import {Tag} from "./Tag";

import {QualificationType, UserType} from "./Enums";
import {Listing} from "./Listing";

export interface User {
  id?: number
  email: string
  name: string
  password?: string
  userType: UserType
  userTags: Tag[]
  qualification?: QualificationType
  receiveEmails: Boolean
  favourites?: Listing[]
}

export interface GetAllUsers {
  users: User[];
}

export const registerUserQuery = gql`
    mutation RegisterUser($email: String!, $name: String!, $password: String!, $userType: UserType!, $tags: [TagInput], $qualification: Qualification) {
        registerUser(
            user: {
                email: $email
                name: $name
                password: $password
                userType: $userType
                userTags: $tags
                qualification: $qualification
            }
        )
        {
            email
            name
            password
            userType
            userTags {
                id
                layer
                title_de
                title_en
            }
            qualification
        }
    }
`;

export const getUserByIdQuery = gql`
  query GetUserById($id: ID!) {
    getById(id: $id) {
      id
      email
      name
      userType
      qualification
      password
      favourites {
        active
        company
        createdAt
        details
        id
        requirement
        title
        university
      }
    }
  }
`;

export const loginUserQuery = gql`
    mutation LoginUser($email: String!, $password: String!) {
        getSession(
            email: $email
            password: $password
        ) {
            refreshToken
            accessToken
            }
    }
`;

export const refreshSessionQuery = gql`
    mutation refreshSessionQuery($token: String!) {
        refreshSession(
            token: $token
        ) {
            refreshToken
            accessToken
            }
    }
`;
export const getFavouritesByUserId = gql`
  query GetFavouritesById($userId: BigInteger! = 2) {
    getFavouritesByUserId(userId: $userId) {
      id,
      title
      details
      requirement
      university
      company
      createdAt
      active
      owner {
        id
        name
      }
      tags {
        id
        title_en
        title_de
        layer
      }
    }
  }
`;

export const updateUserQuery = gql`
    mutation UpdateUser(
    $id: BigInteger!,
    $email: String!,
    $name: String!,
    $password: String!,
    $userType: UserType!,
    $userTags: [TagInput],
    $qualification: Qualification!,
    $receiveEmails: Boolean)
    {
        updateUser(
            user: {
                id: $id
                email: $email
                name: $name
                userType: $userType
                userTags: $userTags
                password: $password
                qualification: $qualification
                receiveEmails: $receiveEmails
            }
        )
        {
            id
            email
            name
            password
            userType
            userTags {
                id
                title_en
                title_de
                layer
              }
            qualification
            receiveEmails
        }
    }
`;


export const changePasswordQuery = gql`
      mutation ChangePassword($oldPassword: String!, $newPassword: String!, $userId: BigInteger!) {
        changePassword(oldPassword: $oldPassword, newPassword: $newPassword, userId: $userId) {
          id
          email
          name
          password
          userType
        }
      }
    `;
