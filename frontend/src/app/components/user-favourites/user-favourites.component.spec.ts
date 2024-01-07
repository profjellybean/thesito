import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFavouritesComponent } from './user-favourites.component';

describe('UserFavouritesComponent', () => {
  let component: UserFavouritesComponent;
  let fixture: ComponentFixture<UserFavouritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserFavouritesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserFavouritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
