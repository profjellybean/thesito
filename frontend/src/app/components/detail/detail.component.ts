import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Listing} from "../../models/Listing";
import {UserService} from "../../services/user.service";
import {ApplicationDialogComponent} from "../application-dialog/application-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent {
  listingId: number = -1;
  listing: Listing;
  userService: UserService;
  success = false;
  successMessage = '';
  error = false;
  errorMessage = '';
  constructor(private route: ActivatedRoute, private router: Router,
              private dialog: MatDialog, private translateService: TranslateService) {
    console.log('Called Constructor');
    this.route.params.subscribe(params => {
      this.listingId = params['id'];
    });
    }

  openApplicationDialog(): void {
    const dialogRef = this.dialog.open(ApplicationDialogComponent, {
      width: '70em',
      height: '50em',
      data: { listingId: this.listingId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'success') {
        this.success = true;
        this.successMessage = 'Application sent successfully';
      } else {
        this.error = true;
        this.errorMessage = 'Application couldn\'t be sent';
      }
    });
  }

  private formatErrorMessage(error: string): void {
    this.translateService.get(error).subscribe((res: string) => {
      this.errorMessage = res;
    }, e => {
      this.errorMessage = error;
    });
  }
}
