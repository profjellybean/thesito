import {User, registerUserQuery} from "../models/User";
import {Observable} from "rxjs";
import {Apollo} from "apollo-angular";
import {Injectable} from "@angular/core";
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
      },
    });
  }
}
