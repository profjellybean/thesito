import {
  User,
  registerUserQuery,
  updateUserQuery,
  changePasswordQuery,
  getFavouritesByUserId,
  getAllUsers
} from "../models/User";
import {map, Observable} from "rxjs";
import {Apollo} from "apollo-angular";
import {Injectable} from "@angular/core";
import {gql} from "@apollo/client/core";
import {AuthService} from "./auth.service";
import {Listing} from "../models/Listing";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private apollo: Apollo, private authService: AuthService) {
  }

  registerUser(user: User): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: registerUserQuery,
      variables: {
        email: user.email,
        name: user.name,
        password: user.password,
        userType: user.userType,
        tags: user.userTags,
        qualification: user.qualification
      },
    });
  }

  getCurrentUser(): Observable<User> {
    return this.getUserById(this.authService.getUserId()).pipe(
      map((user) => {
        return {
          name: user.name,
          email: user.email,
          id: user.id,
          userTags: user.userTags,
          userType: user.userType,
          qualification: user.qualification,
          favourites: user.favourites,
          receiveEmails: user.receiveEmails
        };
      })
    )
  }

  getAllUsers(): Observable<User[]> {
    return this.apollo.query<{ getAllUsers: User[] }>({
      query: getAllUsers,
    }).pipe(
      map((result) => result.data.getAllUsers)
    );
  }

  deleteUserById(id: number): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: gql`
      mutation DeleteUser($userId: BigInteger!) {
        deleteUserById(userId: $userId)
      }
    `,
      variables: {
        userId: id,
      },
    });
  }


  getFavouritesByUser(): Observable<Listing[]> {
    return this.apollo.query<any>({
      query: getFavouritesByUserId,
      variables: {
        userId: this.authService.getUserId()
      }
    }).pipe(
      map((result) => result.data.getFavouritesByUserId)
    );
  }

  updateUser(user: User): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: updateUserQuery,
      variables: {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        password: user.password,
        userType: user.userType,
        userTags: user.userTags,
        qualification: user.qualification,
        receiveEmails: user.receiveEmails
      },
    });
  }

  getUserById(id: number): Observable<User> {
    return this.apollo
    .query<{ getUserById: User }>({
      query: gql`
        query GetUserById($id: BigInteger!) {
          getUserById(id: $id) {
            email
            name
            userType
            id
            password
            qualification
            receiveEmails
            userTags {
              id
              title_en
              title_de
              layer
            }
            favourites {
              id
              title
              details
              requirement
              university
              company
              active
              owner {
                id
              }
              tags {
                id
                title_en
                title_de
                layer
              }
            }
          }
        }
      `,
      variables: {
        id: id,
      },
    })
    .pipe(
      map((result) => result.data.getUserById)
    );
  }

  changePassword(oldPassword: string, newPassword: string, userId: number): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: changePasswordQuery,
      variables: {
        oldPassword,
        newPassword,
        userId
      }
    });
  }

  toggleFavourite(userId: number, listingId: string): Observable<any> {
    console.log(userId, listingId)
    return this.apollo.mutate<any>({
      mutation: gql`
        mutation ToggleFavourite($userId: BigInteger!, $listingId: BigInteger!) {
          toggleFavouriteListing(userId: $userId, listingId: $listingId)
        }
      `,
      variables: {
        userId,
        listingId
      }
    });
  }

  makeUserAdmin(userId: number): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation makeAdmin($userId: BigInteger!, $userIdCurrent: BigInteger!) {
          makeAdmin(userId: $userId, userIdCurrent: $userIdCurrent)
        }
      `,
      variables: {
        userId,
        userIdCurrent: this.authService.getUserId()
      }
    });
  }
}
