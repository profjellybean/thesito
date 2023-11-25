import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>(this.loadLanguage());
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor(private translateService: TranslateService) {}

  toggleLanguage() {
    const currentLanguage = this.currentLanguageSubject.value === 'en' ? 'de' : 'en';
    this.currentLanguageSubject.next(currentLanguage);
    this.saveLanguage(currentLanguage);
    this.translateService.use(currentLanguage); // Set the language for ngx-translate
  }

  private saveLanguage(language: string) {
    localStorage.setItem('selectedLanguage', language);
  }

  public loadLanguage(): string {
    return localStorage.getItem('selectedLanguage') || 'en';
  }

  public getLanguage(): string {
    return this.currentLanguageSubject.value;
  }
}
