import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListigsOfUserComponent } from './admin-listigs-of-user.component';

describe('AdminListigsOfUserComponent', () => {
  let component: AdminListigsOfUserComponent;
  let fixture: ComponentFixture<AdminListigsOfUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminListigsOfUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminListigsOfUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
