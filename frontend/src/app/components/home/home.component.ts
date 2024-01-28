import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {NotificationService} from "../../services/notification.service";
import {AuthService} from "../../services/auth.service";
import {Notification} from "../../models/Notification";
import { CommonModule } from '@angular/common';
import {UserService} from "../../services/user.service";
import {Listing} from "../../models/Listing";
import {Observable} from "rxjs";
import {Tag} from "../../models/Tag";
import {TagService} from "../../services/tag.service";


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

  trendingTags: Observable<Tag[]>;
  selectedTag: any = null;

  // Add a new property for the selected role, default to 'consumer'
  selectedRole: 'consumer' | 'producer' ;

  // Method to handle role change
  onRoleChange(role: 'consumer' | 'producer'): void {
    this.selectedRole = role;
  }

  constructor(public router: Router, private notificationService: NotificationService,
              public authService: AuthService, private userService: UserService,
              private tagService: TagService) {
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

      if (this.authService.isProducer()){
        this.selectedRole = "producer";
      } else if (this.authService.isConsumer()){
        this.selectedRole = "consumer";
      }

        this.userService.getFavouritesByUser().subscribe(favourites => {
          this.favourites = favourites;
          this.favoritesLoaded = favourites!==null;
        });

        this.trendingTags = this.tagService.getTrendingTags();

    }else {
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 100);
    }
  }

  goToCreateListing(){
    this.router.navigate(['/listing/create'])
  }


  formatDate(dateString: Date): string {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${this.pad(date.getMonth() + 1)}.${this.pad(date.getDate())}`;
  }

  private pad(number: number): string {
    return number < 10 ? `0${number}` : number.toString();
  }


}
