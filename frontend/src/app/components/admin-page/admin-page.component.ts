import {Component, OnInit, ViewChild} from '@angular/core';
import {User} from "../../models/User";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {AdminListigsOfUserComponent} from "../admin-listigs-of-user/admin-listigs-of-user.component";
import {MatDialog, MatDialogActions, MatDialogClose,} from "@angular/material/dialog";

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent implements OnInit{

  users: User[];
  usersLoaded: boolean = false;

  info = false;
  infoMessage = '';
  error = false;
  errorMessage = '';

  displayedColumns: string[] = ['id', 'name', 'userType']

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
    const dialogRef = this.dialog.open(AdminListigsOfUserComponent, {
      width: '98%',
      height: '80%',
      data: { userId: userId},
    });
  }

}
