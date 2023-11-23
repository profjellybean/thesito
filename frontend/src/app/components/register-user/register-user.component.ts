import {Component} from '@angular/core';
import {User, UserType} from '../../models/User';
import {UserService} from "../../services/UserService";

@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.css'
})
export class RegisterUserComponent {
  confirm_password: string;
  confirm_email: string;
  userService: UserService;
  user: User;

  constructor(userService: UserService) {
    this.userService = userService;
    this.user = {
      email: "",
      name: "",
      password: "",
      userType: UserType.ListingConsumer,
    };
    this.confirm_email = "";
    this.confirm_password = "";
  }


  registerUser() {
    // Validate email and confirm email
    if (this.user.email !== this.confirm_email) {
      alert('Emails do not match'); //TODO: proper frontend error handling
      return;
    }

    // Validate password and confirm password
    if (this.user.password !== this.confirm_password) {
      alert('Passwords do not match');
      return;
    }

    this.userService.registerUser(this.user).subscribe(res => {
      if(res.data != null) {
        alert("SUCCESS!")
      } else {
        console.log(res)
      }
    })
  }

  protected readonly UserType = UserType;
}
