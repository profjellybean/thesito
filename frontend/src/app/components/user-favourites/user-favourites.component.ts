import {Component, Input, OnInit} from '@angular/core';
import {UserService} from "../../services/user.service";
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-user-favourites',
  templateUrl: './user-favourites.component.html',
  styleUrl: './user-favourites.component.css'
})
export class UserFavouritesComponent implements OnInit {
  @Input() listing_id: string | undefined;
  isFavourite: boolean = false;

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.findFavorite();
  }

  findFavorite(): void {
    this.userService.getCurrentUser().subscribe(user => {
      if (user?.id && this.listing_id) {
        user.favourites?.find(favourite => {
          if (favourite.id === this.listing_id) {
            this.isFavourite = true;
          }
        })
      }
    })
  }

  toggleFavourite() {
    this.userService.getCurrentUser().subscribe(user => {
      if (user?.id && this.listing_id) {
        this.userService.toggleFavourite(user.id, this.listing_id).subscribe(() => {
          this.isFavourite = !this.isFavourite;
        })
      }
    })
  }
}
