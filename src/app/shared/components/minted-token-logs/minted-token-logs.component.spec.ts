import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MintedTokenLogsComponent } from './minted-token-logs.component';

describe('MintedTokenLogsComponent', () => {
  let component: MintedTokenLogsComponent;
  let fixture: ComponentFixture<MintedTokenLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MintedTokenLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MintedTokenLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
