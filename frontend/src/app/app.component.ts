import {Component, OnInit} from '@angular/core';
import {RegisterUserComponent} from "./components/register-user/register-user.component";
import {Router} from "@angular/router";
import {TranslateService} from '@ngx-translate/core';
import {LanguageService} from "./services/language.service";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService, private languageService: LanguageService) {}

  ngOnInit() {
    const initialLanguage = this.languageService.loadLanguage();
    this.translate.use(initialLanguage);
  }

  protected readonly RegisterUserComponent = RegisterUserComponent;
}