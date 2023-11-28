import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl} from "@angular/forms";
import {User, UserType} from "../../models/User";
import {UserService} from "../../services/user.service";
import {AuthService} from "../../services/auth.service";
import {LanguageService} from "../../services/language.service";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {TagService} from "../../services/tag.service";
import {Tag} from "../../models/Tag";
import {QualificationType} from "../../models/Listing";

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
        this.tagsLoaded = true;
        console.log(this.user.userTags)
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
    console.log(this.user.userTags)
    if(this.user.userTags && this.selectedTags.length < 3){
      this.error = true
      this.errorMessage = "notEnoughTagsError"
      return;
    }
    this.vanishError()
    this.user.qualification = this.academicCareer;
    this.user = {
      ...this.user,  // Copy existing properties
      userTags: [...this.selectedTags],  // Update userTags property
      qualification: this.academicCareer, // Update qualification property
    };
    console.log('New User Tags:', this.user.userTags);

    this.userService.updateUser(this.user).subscribe({
      next: result => {
        this.info = true;
        this.infoMessage = 'User updated successfully';
      },
      error: error => {
        this.error = true;
        this.errorMessage = error.message;
      }
    });
  }

  goToEditProfile(){
    this.router.navigate(['/user/edit/' + this.user.id]);
  }

  addTagToUser(tags: Tag[]): void {
    this.selectedTags = tags;
    console.log('Current Tags: ', this.selectedTags)
  }

  protected readonly QualificationType = QualificationType;
  protected readonly console = console;
}
