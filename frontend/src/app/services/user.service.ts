import {User, registerUserQuery, updateUserQuery, changePasswordQuery} from "../models/User";
import {map, Observable} from "rxjs";
import {Apollo} from "apollo-angular";
import {Injectable} from "@angular/core";
import {gql} from "@apollo/client/core";
import {AuthService} from "./auth.service";
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private apollo: Apollo, private authService: AuthService) {}

  registerUser(user: User): Observable<any> {
    console.log(user)
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
        };
      })
    )
  }

  updateUser(user: User): Observable<any> {
    console.log('User to update: ', user)
    return this.apollo.mutate<any>({
      mutation: updateUserQuery,
      variables: {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        password: user.password,
        userType: user.userType,
        userTags: user.userTags,
        qualification: user.qualification
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
              userTags {
                id
                title_en
                title_de
                layer
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
    console.log(oldPassword, newPassword, userId);
    return this.apollo.mutate<any>({
      mutation: changePasswordQuery,
      variables: {
        oldPassword,
        newPassword,
        userId
      }
    });
  }

}
