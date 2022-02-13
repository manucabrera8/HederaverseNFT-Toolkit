import { TestBed } from '@angular/core/testing';

import { HederaApiService } from './hedera-api.service';

describe('HederaApiService', () => {
  let service: HederaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HederaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
