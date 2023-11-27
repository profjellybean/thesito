import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormControl} from "@angular/forms";
import {UserType} from "../../models/User";
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

  id: number;
  name: string;
  role: UserType;
  email: string;
  owner: boolean = false;

  info = false;
  infoMessage = '';

  error = false;
  errorMessage = '';

  selectedTags: string[] = [];
  allTags: string[] = []; // Initialize to an empty array
  filteredTags: Observable<string[]>;
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

    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag !== null ? this._filter(tag) : this.allTags.slice())),
    );

    this.id = -1;
    this.name = "";
    this.email = "";
    this.role = UserType.ListingConsumer;
  }

  ngOnInit(): void {
    if(this.authService.isLoggedIn()){
      this.id = this.authService.getUserId();
    } else {
      setTimeout(() => {
        this.router.navigate(['/404']);
      }, 100);
    }

    let user = this.userService.getUserById(Number(this.id))
    user.subscribe({
      next: user =>{
        this.name = user.name;
        this.role = user.userType;
        this.email = user.email;
      },
      error: error2 =>{
        this.error = true;
        this.errorMessage = error2.message;
      }
    });

    this.tagService.getAllTags().subscribe({
      next: (result:any) =>{
        if (result.data && result.data.getAllTags && Array.isArray(result.data.getAllTags)) {
          this.allTags = result.data.getAllTags.map((tag: Tag) => this.getTagTitles(tag));
        } else {
          console.error('Invalid data structure for tags:', result);
        }
        // Notify the filteredTags observable about the changes
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map((tag: string | null) => (tag !== null ? this._filter(tag) : this.allTags.slice())),
        );
      },
      error: error => {
        console.error('Error fetching tags:', error);
      }
    })

  }

  getTagTitles(tag: Tag): string {
    return this.languageService.loadLanguage() === 'en' ? tag.title_en : tag.title_de;
  }

  remove(tag: string): void {
    const index = this.selectedTags.indexOf(tag);

    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;

    if (value && !this.selectedTags.includes(value)) {
      this.selectedTags.push(value);
    }

    // Clear the input value
    this.tagInput!.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value ? value.toLowerCase() : '';

    return this.allTags.filter(
      (tag) => tag && tag.toLowerCase().includes(filterValue) && !this.selectedTags.includes(tag)
    );
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
      this.errorMessage = "notEnoughTagsError"
      return;
    }
    this.vanishError()
  }

  goToEditProfile(){
    this.router.navigate(['/user/edit/' + this.id]);
  }

}
