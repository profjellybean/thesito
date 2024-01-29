import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteConfirmationDialogUserComponent } from './delete-confirmation-dialog-user.component';

describe('DeleteConfirmationDialogUserComponent', () => {
  let component: DeleteConfirmationDialogUserComponent;
  let fixture: ComponentFixture<DeleteConfirmationDialogUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteConfirmationDialogUserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteConfirmationDialogUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
