import {Injectable} from '@angular/core';
import {Observable, of} from "rxjs";
import {Router} from "@angular/router";
import {Apollo} from "apollo-angular";
import {User, registerUserQuery, loginUserQuery} from "../models/User";
import {catchError, map} from 'rxjs/operators';
import jwt_decode from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private apollo: Apollo) {
  }

  loginUser(email: String, password: String): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: loginUserQuery,
      variables: {
        email: email,
        password: password,
      },
    });
  }

  getUserId(): number {
    let token = this.getToken();
    if (token != null) {
      token = this.decodeToken(token);
      // @ts-ignore
      return Number(token.upn)
    }
    return -1;
  }


  authenticateUser(email: string, password: string): Observable<boolean> {
    return this.loginUser(email, password).pipe(
      map((res: any) => { // Consider replacing 'any' with the actual expected type of the response
        if (res.data != null) {
          this.setToken(res.data.loginUser);
          return true;
        } else {
          return false;
        }
      }),
      catchError((error: any) => { // Consider replacing 'any' with the actual expected type of the error
        // Here you can handle the error, log it, or do something else
        // Then, return an Observable with a false value
        return of(false);
      })
    );
  }


  /**
   * Check if a valid JWT token is saved in the localStorage
   */
  isLoggedIn() {
    return !!this.getToken() //&& (this.getTokenExpirationDate(this.getToken()).valueOf() > new Date().valueOf());
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  logoutUser() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  /*getTokenSub(): string {
    if (this.getToken() != null) {
      const decoded: any = jwt_decode(this.getToken());
      return decoded.sub;
    }
    return null;
  }
   */
  decodeToken(token: string) {
    const _decodeToken = (token: string) => {
      try {
        return JSON.parse(atob(token));
      } catch {
        return null;
      }
    };

    return token
      .split('.')
      .map(tokenPart => _decodeToken(tokenPart))
      .reduce((acc, curr) => {
        if (curr) {
          acc = {...acc, ...curr};
        }
        return acc;
      }, {} as any); // Adjust the type as needed
  }


  private setToken(authResponse: string) {
    localStorage.setItem('authToken', authResponse);
  }

  private getTokenExpirationDate(token: string): Date | null {
    /*const decoded: any = jwt_decode(token);
    if (decoded.exp === undefined) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  */
    return null
  }


}
