import {Injectable} from "@angular/core";
import {Apollo} from "apollo-angular";
import {map, Observable} from "rxjs";
import {getAllNotificationsForUserWithId, Notification} from "../models/Notification";


@Injectable({
  providedIn: 'root'
})
export class NotificationService{
  constructor(private apollo: Apollo) {
  }


  getAllNotificationsForUserWithId(id: number): Observable<Notification[]> {
    return this.apollo.query<{ getAllNotificationsForUserWithId: Notification[] }>({
      query: getAllNotificationsForUserWithId,
      variables: {
        id: Number(id)
      }
    }).pipe(
      map((result) => result.data.getAllNotificationsForUserWithId)
    )
  }

}
