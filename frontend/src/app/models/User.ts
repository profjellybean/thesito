import {gql} from "@apollo/client/core";
import {Tag} from "./Tag";
export interface User {
  id?: string
  email: string
  name: string
  password?: string
  userType: UserType
  tags?: Tag[]
}

export enum UserType {
  "Administrator",
  "ListingConsumer",
  "ListingProvider"
}

export interface GetAllUsers {
  users: User[];
}

export const registerUserQuery = gql`
    mutation RegisterUser($email: String!, $name: String!, $password: String!, $userType: UserType!, $tags: [TagInput]) {
        registerUser(
            user: {
                email: $email
                name: $name
                password: $password
                userType: $userType
                userTags: $tags
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
        }
    }
`;

export const getUserByIdQuery = gql`
  query GetUserById($id: ID!) {
    getById(id: $id) {
      id
      email
      name
      password
      userType
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

export const updateUserQuery = gql`

    mutation UpdateUser($id: BigInteger!, $email: String!, $name: String!, $password: String!, $userType: UserType!) {
        updateUser(
            user: {
                id: $id
                email: $email
                name: $name
                password: $password
                userType: $userType
            }
        )
        {
            id
            email
            name
            password
            userType
        }
    }
`;
