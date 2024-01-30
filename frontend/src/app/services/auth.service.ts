import {Injectable} from '@angular/core';
import {Observable, of, BehaviorSubject, filter, take, switchMap, from, Subject} from "rxjs";
import {Router} from "@angular/router";
import {Apollo} from "apollo-angular";
import {User, registerUserQuery, loginUserQuery, refreshSessionQuery} from "../models/User";
import { catchError, map } from 'rxjs/operators';
import { jwtDecode } from "jwt-decode";
import {subscribe} from "graphql/execution";
import {UserService} from "./user.service";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isRefreshing = false;

  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private sessionUpdated = new Subject<void>();
  sessionUpdated$ = this.sessionUpdated.asObservable();

  constructor(private router: Router, private apollo: Apollo) {
  }

  // checks if there is a valid access token
  // if not it uses the refresh token to get a new access token
   public isLoggedIn(): boolean {
     if (this.isTokenValid(this.getToken())){
       return true;
     }
     if (this.isTokenValid(this.getRefreshToken())){
       if (this.isRefreshing){
         return true;
       }
       this.refreshTokenIfNeeded();
       return true;
     }
     this.logoutUser();
     return false;
   }

   public isProducer(): boolean {
      let token = this.getToken();
      if (token != null) {
        token = this.decodeToken(token);
        // @ts-ignore
        return token.userType.includes("ListingProvider")
      }
      return false;
   }

   public isConsumer(): boolean {
      let token = this.getToken();
      if (token != null) {
        token = this.decodeToken(token);
        // @ts-ignore
        return token.userType.includes("ListingConsumer")
      }
      return false;
   }

  public isAdministrator(): boolean {
    let token = this.getToken();
    if (token != null) {
      token = this.decodeToken(token);
      // @ts-ignore
      return token.userType.includes("Administrator")
    }
    return false;
  }

   private isTokenValid(token: string | null): boolean{
     try {
       if (token){
         const decodedToken: any = jwtDecode(token);
         const currentTime = Date.now() / 1000; // Convert to seconds since epoch.
         if (decodedToken.exp >= currentTime) {
           return true;
         }
       }
       return false;
     } catch {
       return false;
     }
   }

   public refreshTokenIfNeeded(): void {
      if (!this.isTokenValid(this.getToken()) && !this.isRefreshing){
        this.isRefreshing = true;
        this.refreshSessionQueryGraphQl().subscribe(
          (res) => {
            this.setSessionToken(res.data.refreshSession.accessToken);
            this.setRefreshToken(res.data.refreshSession.refreshToken);
            this.isRefreshing = false;
          },
          (error) => {
          this.isRefreshing = false;
          this.logoutUser()
          }
        )
      }
   }

  public refreshSessionQueryGraphQl(): Observable<any> {
    return this.apollo.mutate<{ refreshSession: boolean }>({
      mutation: refreshSessionQuery,
      variables: {
        token: this.getRefreshToken(),
      },
    });
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

  getSession(email: string, password: string): Observable<boolean> {
    return this.loginUser(email, password).pipe(
      map((res: any) => {
        if (res.data != null) {
          this.setSessionToken(res.data.getSession.accessToken);
          this.setRefreshToken(res.data.getSession.refreshToken);
          this.sessionUpdated.next(); // Emit event after session update
          return true;
        } else {
          return false;
        }
      }),
      catchError((error: any) => {
        return of(false);
      })
    );
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
  removeTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  removeAccessToken(): void {
    localStorage.removeItem('accessToken');
  }

  logoutUser() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

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

  private setSessionToken(authResponse: string) {
    localStorage.setItem('accessToken', authResponse);
  }

  private setRefreshToken(authResponse: string) {
    localStorage.setItem('refreshToken', authResponse);
  }

  private getTokenExpirationDate(token: string): Date | null {
    const decoded: any = jwtDecode(token);
    if (decoded.exp === undefined) {
      return null;
    }
    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
    //return null
  }
}
