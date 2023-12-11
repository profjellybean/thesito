import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl} from "@angular/forms";
import {User} from "../../models/User";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {LanguageService} from "../../services/language.service";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {TagService} from "../../services/tag.service";
import {Tag} from "../../models/Tag";

import {QualificationType, UserType} from "../../models/Enums";

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit{
  owner: boolean = false;
  user: User;
  info = false;
  infoMessage = '';
  error = false;
  errorMessage = '';
  selectedTags: Tag[] = []
  tagsLoaded = false;
  academicCareer: QualificationType = QualificationType.None

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;

  constructor(private router: Router,
              private userService: UserService,
              private authService: AuthService
              ) {

    this.user = {
      id: -1,
      email: "",
      name: "",
      password: "",
      userType: UserType.ListingConsumer,
      userTags: [],
      qualification: QualificationType.None
    };
  }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.user.id = this.authService.getUserId();
    } else {
      setTimeout(() => {
        this.router.navigate(['/404']);
      }, 100);
    }
    let user = this.userService.getUserById(Number(this.user.id))
    user.subscribe({
      next: user =>{
        this.user = user;
        this.academicCareer = this.user.qualification;
        let tempTags: Tag[] = [];
        this.user.userTags.forEach(tag =>{
          let t = {
            id: tag.id,
            layer: tag.layer,
            title_de: tag.title_de,
            title_en: tag.title_en
          }
          tempTags.push(t)
          this.selectedTags.push(t)
        });
        this.user = {
          ...this.user,  // Copy existing properties
          userTags: [...tempTags],  // Update userTags property
          password: ''
        };
        this.tagsLoaded = true;
      },
      error: error2 =>{
        this.error = true;
        this.errorMessage = error2.message;
      }
    });
  }

  vanishInfo(): void {
    this.info = false;
    this.infoMessage = '';
  }

  vanishError(): void {
    this.error = false;
    this.errorMessage = '';
  }

  save():void{
    if(this.selectedTags.length < 3){
      this.error = true
      this.errorMessage = 'notEnoughTagsError'
      return;
    }
    this.vanishError()
    this.vanishInfo()
    this.user = {
      ...this.user,  // Copy existing properties
      userTags: [...this.selectedTags],  // Update userTags property
      qualification: this.academicCareer, // Update qualification property
    };
    this.userService.updateUser(this.user).subscribe({
      next: result => {
        this.info = true;
        this.infoMessage = 'userUpdateSuccess';
      },
      error: error => {
        this.error = true;
        this.errorMessage = error.message;
      }
    });
  }

  goToEditProfile(){
    this.router.navigate(['/user/edit/']);
  }

  addTagToUser(tags: Tag[]): void {
    this.selectedTags = tags;
    console.log('Current Tags: ', this.selectedTags)
  }
  protected readonly QualificationType = QualificationType;
}