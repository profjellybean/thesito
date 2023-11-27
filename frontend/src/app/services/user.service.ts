import {User, registerUserQuery, updateUserQuery} from "../models/User";
import {map, Observable} from "rxjs";
import {Apollo} from "apollo-angular";
import {Injectable} from "@angular/core";
import {gql} from "@apollo/client/core";
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private apollo: Apollo) {}

  registerUser(user: User): Observable<any> {
    console.log(user)
    return this.apollo.mutate<any>({
      mutation: registerUserQuery,
      variables: {
        email: user.email,
        name: user.name,
        password: user.password,
        userType: user.userType,
        tags: user.tags
      },
    });
  }

  updateUser(user: User): Observable<any> {
    console.log('User to update: ')
    console.log(user)
    return this.apollo.mutate<any>({
      mutation: updateUserQuery,
      variables: {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        password: user.password,
        userType: user.userType,
      },
    });
  }

  getUserById(id: number): Observable<User> {
    return this.apollo
      .query<{ getUserById: User }>({
        query: gql`
          query GetUserById($id: BigInteger!) {
            getUserById(id: $id) {
              id
              email
              name
              userType
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
}
