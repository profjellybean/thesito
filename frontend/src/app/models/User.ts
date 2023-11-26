import {gql} from "@apollo/client/core";
export interface User {
  id?: string
  email: string
  name: string
  password?: string
  userType: UserType
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

    mutation RegisterUser($email: String!, $name: String!, $password: String!, $userType: UserType!) {
        registerUser(
            user: {
                email: $email
                name: $name
                password: $password
                userType: $userType
            }
        )
        {
            email
            name
            password
            userType
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
        loginUser(
            email: $email
            password: $password
        )
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
