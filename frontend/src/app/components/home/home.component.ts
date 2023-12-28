import {Component, OnInit} from '@angular/core';
import {Notification} from "../../models/Notification";
import {Router} from "@angular/router";
import {NotificationService} from "../../services/notification.service";
import {AuthService} from "../../services/auth.service";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {NotificationType} from "../../models/Enums";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  ownerId: number;
  notifications: Notification[];

  info = false;
  infoMessage = '';
  error = false;
  errorMessage = '';

  notificationsLoaded: Boolean = false;

  constructor(private router: Router, private notificationService: NotificationService, private authService: AuthService) {
  }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.ownerId = this.authService.getUserId();
      this.notificationService.getAllNotificationsForUserWithId(this.ownerId).subscribe({
        next: result =>{
          this.notifications = result;
          this.notificationsLoaded = true;

          this.notifications = this.notifications.sort((a, b): number => {
            let n: number = -1;
            if (a.createdAt instanceof Date && b.createdAt instanceof Date){
              n = a.createdAt.getTime() - b.createdAt.getTime();
            }
            return n == -1 ? -1 : n;
          });
          console.log("Notifications: ", this.notifications)
        },
        error: error =>{
          this.error = true;
          this.errorMessage = error.message;
        }
      })



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


  protected readonly NotificationType = NotificationType;
}
