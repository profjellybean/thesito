import {Component} from '@angular/core';
import {Listing, QualificationType} from "../../models/Listing";
import {ListingService} from "../../services/listing.service";

@Component({
  selector: 'app-all',
  templateUrl: './all.component.html',
  styleUrl: './all.component.css'
})


export class AllComponent {
  listingService: ListingService;
  listings: Listing[] = [];

  constructor(listingService: ListingService) {
    this.listingService = listingService;
  }

  ngOnInit(): void {
    this.listingService.getAllListings().subscribe((listings) => {
      this.listings = listings;
    });
  }

 qualificationToString(q: QualificationType): string {
    switch (q) {
      case QualificationType.None:
        return 'qualificationNone';
      case QualificationType.Bachelors:
        return 'bachelors';
      case QualificationType.Masters:
        return 'masters';
      case QualificationType.PhD:
        return 'phd';
    }
  }
}
