import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Tag} from "../../models/Tag";
import {Observable, startWith} from "rxjs";
import {map} from "rxjs/operators";
import {TagService} from "../../services/tag.service";
import {FormControl} from "@angular/forms";
import {LanguageService} from "../../services/language.service";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {LangChangeEvent, TranslateService} from "@ngx-translate/core";
import {assertValidExecutionArguments} from "graphql/execution/execute";

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.css'
})
export class TagComponent implements  OnInit {
  allTags: Tag[] = []; // Initialize to an empty array
  selectedTags: Tag[] = [];
  tagCtrl = new FormControl();
  filteredTags: Observable<Tag[]>;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement> | undefined;
  @Input() shallow = false;
  @Input() title: string = 'interests';
  @Output() updateTag = new EventEmitter<Tag[]>();

  constructor(private translate: TranslateService, private tagService: TagService, public languageService: LanguageService) {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => (tag !== null ? this._filter(tag) : this.allTags.slice())),
    );
  }
  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getAllTags()
    });
    this.getAllTags();


  }

  getAllTags(): void {
    this.tagService.getAllTags(this.shallow).subscribe(
      (result: any) => {
        console.log(result); // Log the result to see what data is being returned
        if (result.data?.getAllTags && Array.isArray(result.data.getAllTags)) {
          this.allTags = result.data.getAllTags//.map((tag: Tag) => this.getTagTitles(tag));
        } else {
          console.error('Invalid data structure for tags:', result);
        }
        // Notify the filteredTags observable about the changes
        this.filteredTags = this.tagCtrl.valueChanges.pipe(
          startWith(null),
          map((tag: string | null) => (tag !== null ? this._filter(tag) : this.allTags.slice())),
        );
      },
      (error) => {
        console.error('Error fetching tags:', error);
      }
    );
  }

  private _filter(value: string): Tag[] {
    if(this.languageService.getLanguage() === 'en') {
      return this.allTags.filter(
        (tag) => tag?.title_en.includes(value) && !this.selectedTags.find(t => t.title_en === tag.title_en)
      );
    } else {
      return this.allTags.filter(
        (tag) => tag?.title_de.includes(value) && !this.selectedTags.find(t => t.title_de === tag.title_de)
      );
    }
  }
  remove(tag: Tag): void {
    let index= this.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.selectedTags.splice(index, 1);
      this.updateTag.emit(this.selectedTags);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    let isIncluded = false;
    this.selectedTags.forEach(tag => {
      if(tag.id === value.id) {
        isIncluded = true;
      }
    })
    if (value && !isIncluded) {
      let tag = {
        id: value.id,
        layer: value.layer,
        title_de: value.title_de,
        title_en: value.title_en
      }
      this.selectedTags.push(tag);
      this.updateTag.emit(this.selectedTags);
    }
    // Clear the input value
    this.tagInput!.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }
}
