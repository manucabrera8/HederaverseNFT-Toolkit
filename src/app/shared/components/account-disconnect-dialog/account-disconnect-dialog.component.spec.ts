import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDisconnectDialogComponent } from './account-disconnect-dialog.component';

describe('AccountDisconnectDialogComponent', () => {
  let component: AccountDisconnectDialogComponent;
  let fixture: ComponentFixture<AccountDisconnectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountDisconnectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountDisconnectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
