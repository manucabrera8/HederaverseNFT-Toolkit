import { TestBed } from '@angular/core/testing';

import { IsLoadingService } from './is-loading.service';

describe('IsLoadingService', () => {
  let service: IsLoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IsLoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
