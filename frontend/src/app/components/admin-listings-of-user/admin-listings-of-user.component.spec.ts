import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListingsOfUserComponent } from './admin-listings-of-user.component';

describe('AdminListigsOfUserComponent', () => {
  let component: AdminListingsOfUserComponent;
  let fixture: ComponentFixture<AdminListingsOfUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminListingsOfUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminListingsOfUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
