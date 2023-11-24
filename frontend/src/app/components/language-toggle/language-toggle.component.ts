import { Component } from '@angular/core';
import {FormBuilder} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-language-toggle',
  templateUrl: './language-toggle.component.html',
  styleUrl: './language-toggle.component.css',

})
export class LanguageToggleComponent {
  isGerman = false;

  constructor(private _formBuilder: FormBuilder, private translate: TranslateService) {
  }

  toggleLanguage(){
    if (this.isGerman) {
      this.translate.use('de');
    }else{
      this.translate.use('en');
    }
  }

}
