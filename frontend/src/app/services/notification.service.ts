import {Injectable} from "@angular/core";
import {Apollo} from "apollo-angular";
import {map, Observable} from "rxjs";
import {deleteUserFromNotification, getAllNotificationsForUserWithId, Notification} from "../models/Notification";


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

  deleteUserFromNotification(userId: number, notificationId: number): Observable<any> {
    return this.apollo.mutate<any>({
      mutation: deleteUserFromNotification,
      variables: {
        userId,
        notificationId
      }
    });
  }



}
