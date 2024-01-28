import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { User } from "../../models/User";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { AdminListingsOfUserComponent } from "../admin-listings-of-user/admin-listings-of-user.component";
import { MatDialog } from "@angular/material/dialog";
import {AdminEditUserComponent} from "../admin-edit-user/admin-edit-user.component";

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {

  users: User[];
  usersLoaded: boolean = false;

  info = false;
  infoMessage = '';
  error = false;
  errorMessage = '';

  success = false;
  successMessage = '';

  @Input() isStandalone: boolean = true;
  // Add 'email', 'qualification', and 'receiveEmails' to the displayedColumns array
  displayedColumns: string[] =  ['id', 'name', 'userType', 'email', 'qualification', 'receiveEmails', 'actions'];
  displayedColumnsNonStandalone: string[] =  ['id', 'name', 'userType', 'actions'];


  // ... other code in your component


  dataSource: MatTableDataSource<User>;

  @ViewChild(MatPaginator) paginator: MatPaginator;


  constructor(private router: Router, private userService: UserService, private authService: AuthService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()){
      this.userService.getAllUsers().subscribe({
        next: result =>{
          this.users = [...result];
          this.users = this.users.sort((a, b): number => {
            if(a.id && b.id){
              let n = a.id - b.id;
              return n;
            }else{
              return -1;
            }
          });

          this.dataSource = new MatTableDataSource<User>(this.users);
          this.dataSource.paginator = this.paginator;
          this.usersLoaded = true;
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

  openUserListingsDialog(userId: number): void {
    const dialogRef = this.dialog.open(AdminListingsOfUserComponent, {
      width: '98%',
      height: '80%',
      data: { userId: userId},
    });
  }

  makeUserAdmin(userId: number): void {
    this.userService.makeUserAdmin(userId).subscribe({
      next: result => {
        this.ngOnInit();
        this.success = true;
        this.successMessage = 'User has been made admin';
      },
      error: err => {
        this.error = true;
        this.errorMessage = err.message;
      }
    });
  }


  editUser(userId: number): void {
    const userToEdit = this.users.find(user => user.id === userId);
    const dialogRef = this.dialog.open(AdminEditUserComponent, {
      width: '500px',
      data: { user: userToEdit }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable(); // Create this method to refresh the table data
      }
    });
  }

  refreshTable(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.dataSource.data = users;
    });
  }

  deleteUser(userId: number): void {
  }
}
