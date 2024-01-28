import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeUsertypeDialogComponent } from './change-usertype-dialog.component';

describe('ChangeUsertypeDialogComponent', () => {
  let component: ChangeUsertypeDialogComponent;
  let fixture: ComponentFixture<ChangeUsertypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeUsertypeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeUsertypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
