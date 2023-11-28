import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl} from "@angular/forms";
import {User, UserType} from "../../models/User";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {constructorParametersDownlevelTransform} from "@angular/compiler-cli";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {Observable, startWith} from "rxjs";
import {LanguageService} from "../../services/language.service";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {TagService} from "../../services/tag.service";
import {map} from "rxjs/operators";
import {Tag} from "../../models/Tag";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

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
  allTags: string[] = []; // Initialize to an empty array
  tagCtrl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;

  constructor(private router: Router,
              private fb: FormBuilder,
              private userService: UserService,
              private route: ActivatedRoute,
              private authService: AuthService,
              private tagService: TagService,
              private languageService: LanguageService) {

    this.user = {
      id: -1,
      email: "",
      name: "",
      password: "",
      userType: UserType.ListingConsumer,
      tags: []
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
      },
      error: error2 =>{
        this.error = true;
        this.errorMessage = error2.message;
      }
    });

  }

  getTagTitles(tag: Tag): string {
    return this.languageService.loadLanguage() === 'en' ? tag.title_en : tag.title_de;
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
    console.log(this.user.tags)
    if(this.user.tags.length < 3){
      this.error = true
      this.errorMessage = "notEnoughTagsError"
      return;
    }
    this.vanishError()
  }

  goToEditProfile(){
    this.router.navigate(['/user/edit/' + this.user.id]);
  }

  addTagToUser(tag: Tag[]): void {
    this.user.tags = tag;
  }

}
