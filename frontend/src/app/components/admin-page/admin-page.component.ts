import {Component, OnInit, Input, ViewChild} from '@angular/core';
import {User} from "../../models/User";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {AdminListingsOfUserComponent} from "../admin-listings-of-user/admin-listings-of-user.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AdminEditUserComponent} from "../admin-edit-user/admin-edit-user.component";
import {
  DeleteConfirmationDialogUserComponent
} from "../delete-confirmation-dialog-user/delete-confirmation-dialog-user.component";
import {TranslateService} from "@ngx-translate/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {

  users: User[];
  usersLoaded: boolean = false;

  @Input() isStandalone: boolean = true;
  // Add 'email', 'qualification', and 'receiveEmails' to the displayedColumns array
  displayedColumns: string[] = ['id', 'name', 'userType', 'email', 'qualification', 'receiveEmails', 'actions'];
  displayedColumnsNonStandalone: string[] = ['id', 'name', 'email', 'userType', 'actions'];


  // ... other code in your component


  dataSource: MatTableDataSource<User>;

  @ViewChild(MatPaginator) paginator: MatPaginator;


  constructor(private router: Router, private userService: UserService, private authService: AuthService, private dialog: MatDialog, private translateService: TranslateService,
              private snackBar: MatSnackBar, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.userService.getAllUsers().subscribe({
        next: result => {
          this.users = [...result];
          this.users = this.users.sort((a, b): number => {
            if (a.id && b.id) {
              let n = a.id - b.id;
              return n;
            } else {
              return -1;
            }
          });
          // Initialize the MatTableDataSource with the fetched users
          this.dataSource = new MatTableDataSource<User>(this.users);
          this.dataSource.paginator = this.paginator;
          this.usersLoaded = true;
        },
        error: error => {
          this.formatErrorMessage(error.message);
        }
      });
    } else {
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 100);
    }
  }


  openUserListingsDialog(userId: number): void {
    const dialogRef = this.dialog.open(AdminListingsOfUserComponent, {
      width: '98%',
      height: '80%',
      data: {userId: userId},
    });
  }



  makeUserAdmin(userId: number): void {
    this.userService.makeUserAdmin(userId).subscribe({
      next: result => {
        this.ngOnInit();
        this.formatSuccessMessage('userMadeAdmin');
      },
      error: err => {
        this.formatErrorMessage(err.message)
      }
    });
  }


  editUser(userId: number): void {
    this.userService.getUserById(userId).subscribe(userToEdit => {
      const dialogRef = this.dialog.open(AdminEditUserComponent, {
        width: '500px',
        data: {user: userToEdit}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.formatSuccessMessage('userUpdateSuccess');
          this.refreshTable();
        }
      }, error => {
        this.formatErrorMessage(error.error.message);
      });
    });
  }

  refreshTable(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.dataSource.data = users;
    });
  }


  deleteUser(user: User): void {
    let dialogRef: MatDialogRef<DeleteConfirmationDialogUserComponent>;

    dialogRef = this.dialog.open(DeleteConfirmationDialogUserComponent, {
      data: { name: user?.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUserById(Number(user?.id)).subscribe({
          next: () => {
            this.formatSuccessMessage('userDeletedSuccessfully')
            this.dataSource.data = this.dataSource.data.filter(u => u.id !== user.id);

            setTimeout(() => location.reload(), 2000);
          },
          error: (error) => {
            this.formatErrorMessage(error.message);
          },
        });
      }
    });
  }

  private showSuccessMessage(): void {
    const translatedMessage = this.translateService.instant('userDeletedSuccessfully');
    const translatedClose = this.translateService.instant('close');

    // Open the snackbar with the translated message
    this.snackBar.open(translatedMessage, translatedClose, {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-success']
    });
  }

  userIsCurrentUser(user: any): boolean {
    // Check if the provided user's ID matches the ID of the current user
    return this.authService.getUserId() === user.id
  }

  private formatErrorMessage(error: string): void {
    this.translateService.get(error).subscribe((res: string) => {
      this.toastr.error(res, 'Error');
    }, e => {
      this.toastr.error(error, 'Error');
    });
  }

  private formatSuccessMessage(success: string): void {
    this.translateService.get(success).subscribe((res: string) => {
      this.toastr.success(res, 'Success');
    }, e => {
      this.toastr.success(e, 'Success');
    });
  }



}
