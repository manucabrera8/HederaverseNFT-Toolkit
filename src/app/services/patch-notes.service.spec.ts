import { TestBed } from '@angular/core/testing';

import { PatchNotesService } from './patch-notes.service';

describe('PatchNotesService', () => {
  let service: PatchNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatchNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
