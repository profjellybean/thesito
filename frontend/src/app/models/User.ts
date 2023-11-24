import {gql} from "@apollo/client/core";
export interface User {
  email: string
  name: string
  password: string
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
