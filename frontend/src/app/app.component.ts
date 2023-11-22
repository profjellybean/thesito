import {Component, OnInit} from '@angular/core';
import {Apollo} from "apollo-angular";
import {gql} from "@apollo/client/core";



interface User {
  id: number;
  email: string
  name: string
  password: string
  userType: UserType
}

enum UserType {
  "Administrator",
"ListingConsumer",
"ListingProvider"
}


interface GetAllUsers {
  users: User[];
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'Thesito';
  users:User[] = []
  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.apollo.watchQuery<GetAllUsers>({
      query: 	gql`{
        getAllUsers{
          name
          id
          email
        }
      }`
    })
      .valueChanges
      .subscribe(({ data, loading }) => {
        // @ts-ignore
        this.users = data.getAllUsers;
        console.log(data)
        console.log(this.users)
      });
  }

}
