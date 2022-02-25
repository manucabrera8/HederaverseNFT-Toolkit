import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTokenUniqueNFTComponent } from './create-token-unique-nft.component';

describe('CreateTokenUniqueNFTComponent', () => {
  let component: CreateTokenUniqueNFTComponent;
  let fixture: ComponentFixture<CreateTokenUniqueNFTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTokenUniqueNFTComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTokenUniqueNFTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
