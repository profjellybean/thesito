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
import {CreateListingComponent} from './components/create-listing/create-listing.component';
import {MatRadioModule} from "@angular/material/radio";
import { LanguageToggleComponent } from './components/language-toggle/language-toggle.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { LanguageService } from './services/language.service';
import {MatButtonModule} from "@angular/material/button";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatOptionModule} from "@angular/material/core";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatChipsModule} from "@angular/material/chips";
import {EditUserComponent} from "./components/edit-user/edit-user.component";
import {AllComponent} from "./components/all/all.component";
import { TagComponent } from './components/tag/tag.component';
import {PasswordChangeDialogComponent} from "./components/password-change-dialog/password-change-dialog.component";
import { MyListingsComponent } from './components/my-listings/my-listings.component';
import { DetailComponent } from './components/listing-details/detail.component';
import { ApplicationDialogComponent } from './components/application-dialog/application-dialog.component';
import { EditListingComponent } from './components/edit-listing/edit-listing.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatGridListModule} from "@angular/material/grid-list";


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    RegisterUserComponent,
    HeaderComponent,
    HomeComponent,
    AllComponent,
    LoginComponent,
    NotFoundComponent,
    LanguageToggleComponent,
    UserDetailsComponent,
    CreateListingComponent,
    EditUserComponent,
    TagComponent,
    PasswordChangeDialogComponent,
    MyListingsComponent,
    DetailComponent,
    ApplicationDialogComponent,
    EditListingComponent,
    NotificationsComponent
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
    MatButtonModule,
    MatToolbarModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatTooltipModule,
    MatGridListModule
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
