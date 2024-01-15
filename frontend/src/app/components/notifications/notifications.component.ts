import {Component, OnInit} from '@angular/core';
import {Notification} from "../../models/Notification";
import {Router} from "@angular/router";
import {NotificationService} from "../../services/notification.service";
import {AuthService} from "../../services/auth.service";
import {NotificationType} from "../../models/Enums";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit{

  ownerId: number;
  notifications: Notification[];

  info = false;
  infoMessage = '';
  error = false;
  errorMessage = '';

  notificationsLoaded: boolean = false;

  constructor(private router: Router, private notificationService: NotificationService, private authService: AuthService) {
  }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.ownerId = this.authService.getUserId();
      this.notificationService.getAllNotificationsForUserWithId(this.ownerId).subscribe({
        next: result =>{
          this.notifications = [...result];
          this.notifications = this.notifications.sort((a, b): number => {
            let n = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return n;
          });
          this.notificationsLoaded = true;
        },
        error: error =>{
          this.error = true;
          this.errorMessage = error.message;
        }
      });

    }else {
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 100);
    }
  }

  routeToListing(id: string | undefined){
    setTimeout(() => {
      this.router.navigate(['/listing/', id]);
    }, 100);
  }

  deleteUserFromNotification(notificationId: number){
    this.notificationService.deleteUserFromNotification(this.ownerId ,notificationId).subscribe();
    this.notifications = this.notifications.filter(obj => {return obj.id !== notificationId});
  }

  protected readonly NotificationType = NotificationType;
}
