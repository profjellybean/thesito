import {Component, OnInit, ViewChild} from '@angular/core';
import {User} from "../../models/User";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {UserService} from "../../services/user.service";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent implements OnInit{

  users: User[];
  usersLoaded: boolean = false;

  itemsPerPage: number = 20

  info = false;
  infoMessage = '';
  error = false;
  errorMessage = '';


  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(private router: Router, private userService: UserService, private authService: AuthService) {
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()){
      console.log("Load users...")
      this.userService.getAllUsers().subscribe({
        next: result =>{
          console.log("Found users: ", result);
          this.users = [...result];

          this.users = this.users.sort((a, b): number => {
            if(a.id && b.id){
              let n = a.id - b.id;
              return n;
            }else{
              return -1;
            }
          });
          this.usersLoaded = true;
          this.dataSource = new MatTableDataSource<any, MatPaginator>(this.users)
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

  get displayedUsers(): any[] {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    return this.users.slice(startIndex, endIndex);
  }

}
