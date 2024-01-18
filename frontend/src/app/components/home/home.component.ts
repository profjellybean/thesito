import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {NotificationService} from "../../services/notification.service";
import {AuthService} from "../../services/auth.service";
import {Notification} from "../../models/Notification";
import { CommonModule } from '@angular/common';
import {UserService} from "../../services/user.service";
import {Listing} from "../../models/Listing";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  ownerId: number;
  notifications: Notification[];

  favourites: Listing[] = [];

  info = false;
  infoMessage = '';
  error = false;
  errorMessage = '';

  notificationsLoaded: Boolean = false;
  favoritesLoaded: Boolean = false;

  constructor(public router: Router, private notificationService: NotificationService,
              private authService: AuthService, private userService: UserService,) {
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
          console.log(this.notifications);
        },
        error: error =>{
          this.error = true;
          this.errorMessage = error.message;
        }
      });

        this.userService.getFavouritesByUser().subscribe(favourites => {
          this.favourites = favourites;
          this.favoritesLoaded = favourites!==null;
          console.log(favourites);
        });

    }else {
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 100);
    }
  }


  formatDate(dateString: Date): string {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${this.pad(date.getMonth() + 1)}.${this.pad(date.getDate())}`;
  }

  private pad(number: number): string {
    return number < 10 ? `0${number}` : number.toString();
  }
}
