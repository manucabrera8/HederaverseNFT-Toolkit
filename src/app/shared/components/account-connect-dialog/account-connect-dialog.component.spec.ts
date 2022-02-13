import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountConnectDialogComponent } from './account-connect-dialog.component';

describe('AccountConnectDialogComponent', () => {
  let component: AccountConnectDialogComponent;
  let fixture: ComponentFixture<AccountConnectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountConnectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountConnectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
