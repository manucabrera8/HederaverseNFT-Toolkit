import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTokenMultipleNFTComponent } from './create-token-multiple-nft.component';

describe('CreateTokenMultipleNFTComponent', () => {
  let component: CreateTokenMultipleNFTComponent;
  let fixture: ComponentFixture<CreateTokenMultipleNFTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTokenMultipleNFTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTokenMultipleNFTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
