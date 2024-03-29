import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { ToastrModule } from 'ngx-toastr';
import {AppRoutingModule, routes} from './app-routing.module';
import {AppComponent} from './app.component';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
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
import {TrendingComponent} from "./components/trending/trending.component";
import { UserFavouritesComponent } from './components/user-favourites/user-favourites.component';
import { FavouritesListComponent } from './components/favourites-list/favourites-list.component';
import { AdminPageComponent } from './components/admin-page/admin-page.component';
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import { AdminListingsOfUserComponent } from './components/admin-listings-of-user/admin-listings-of-user.component';
import {
  MAT_DIALOG_DATA,
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogTitle
} from "@angular/material/dialog";
import {MatMenuModule} from "@angular/material/menu";
import { DeleteConfirmationDialogComponent } from './components/delete-confirmation-dialog-listing/delete-confirmation-dialog.component';
import { DeleteConfirmationDialogUserComponent } from './components/delete-confirmation-dialog-user/delete-confirmation-dialog-user.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import { ChangeUsertypeDialogComponent } from './components/change-usertype-dialog/change-usertype-dialog.component';
import { AdminEditUserComponent } from './components/admin-edit-user/admin-edit-user.component';
import { GraphQLModule } from './graphql/graphql.module';
import {MatButtonToggleModule} from "@angular/material/button-toggle";


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
    TrendingComponent,
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
    NotificationsComponent,
    UserFavouritesComponent,
    FavouritesListComponent,
    AdminPageComponent,
    AdminListingsOfUserComponent,
    DeleteConfirmationDialogComponent,
    DeleteConfirmationDialogUserComponent,
    ChangeUsertypeDialogComponent,
    DeleteConfirmationDialogComponent,
    AdminEditUserComponent
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
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatTableModule,
    MatCardModule,
    MatMenuModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatCheckboxModule,
    GraphQLModule,
    MatButtonToggleModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
    })
  ],
  providers: [
    LanguageService,
   // {
   //   provide: APOLLO_OPTIONS,
   //   useFactory: (httpLink: HttpLink) => {
   //     return {
   //       cache: new InMemoryCache(),
   //       link: httpLink.create({
   //         uri: 'http://localhost:8080/graphql'
   //       })
   //     };
   //   },
   //   deps: [HttpLink]
   // },
    {provide: MAT_DIALOG_DATA, useValue: {listingId: -1}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
