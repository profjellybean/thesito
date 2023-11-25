import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule, routes} from './app-routing.module';
import {AppComponent} from './app.component';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {MatIconModule} from "@angular/material/icon";
import {NotFoundComponent} from './components/not-found/not-found.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {APOLLO_OPTIONS, ApolloModule} from "apollo-angular";
import {HttpLink} from 'apollo-angular/http';
import {InMemoryCache} from '@apollo/client/core';
import {RegisterUserComponent} from './components/register-user/register-user.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import {HeaderComponent} from './components/header/header.component';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {MatRadioModule} from "@angular/material/radio";
import { LanguageToggleComponent } from './components/language-toggle/language-toggle.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { LanguageService } from './services/language.service';
import {MatButtonModule} from "@angular/material/button";


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    RegisterUserComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    NotFoundComponent,
    LanguageToggleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ApolloModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatIconModule,
    ApolloModule,
    FormsModule,
    RouterModule.forRoot(routes),
    ReactiveFormsModule,
    MatRadioModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'en'
    }),
    MatSlideToggleModule,
    MatButtonModule
  ],
  providers: [
    LanguageService,
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: 'http://localhost:8080/graphql'
          })
        };
      },
      deps: [HttpLink]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
