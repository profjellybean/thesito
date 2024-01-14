import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Listing } from '../../models/Listing';
import {Router} from "@angular/router";

@Component({
  selector: 'app-favourites-list',
  templateUrl: './favourites-list.component.html',
  styleUrls: ['./favourites-list.component.scss']
})
export class FavouritesListComponent implements OnInit {
  favourites: Listing[] = [];

  constructor(private userService: UserService, private router: Router) {

  }
  ngOnInit(): void {
    this.userService.getFavouritesByUser().subscribe(favourites => {
      this.favourites = favourites;
    });
  }

  goToListing(id: string | undefined) {
    this.router.navigate(['/listing', id]);
  }


}
