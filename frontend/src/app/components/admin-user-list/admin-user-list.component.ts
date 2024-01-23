import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {User} from "../../models/User";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './admin-user-list.component.html',
  styleUrl: './admin-user-list.component.css'
})
export class AdminUserListComponent implements OnInit {
  users: User[];
  usersLoaded: boolean =  false;
  displayedColumns: string[] = ['id', 'name', 'email', 'role']
  success = false;
  successMessage = '';
  error = false;
  errorMessage = '';

  @Input() isStandalone: boolean = true;

  constructor(private userService: UserService,
              private router: Router,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: result => {
        this.users = [...result];
        this.usersLoaded = true;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  makeUserAdmin(userId: number): void {
    this.userService.makeUserAdmin(userId).subscribe({
      next: result => {
        console.log(result);
        this.ngOnInit();
        this.success = true;
        this.successMessage = 'User has been made admin';
      },
      error: err => {
        console.log(err);
        this.error = true;
        this.errorMessage = err.message;
      }
    });
  }

}
