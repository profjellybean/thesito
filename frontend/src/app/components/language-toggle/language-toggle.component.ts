import {Component} from '@angular/core';
import {LanguageService} from "../../services/language.service";

@Component({
  selector: 'app-language-toggle',
  templateUrl: './language-toggle.component.html',
  styleUrl: './language-toggle.component.css',
})
export class LanguageToggleComponent {
  currentLanguage: string | undefined;

  constructor(private languageService: LanguageService) {
    this.languageService.currentLanguage$.subscribe((language) => {
      this.currentLanguage = language;
    });
  }

  toggleLanguage() {
    this.languageService.toggleLanguage();
  }

}
