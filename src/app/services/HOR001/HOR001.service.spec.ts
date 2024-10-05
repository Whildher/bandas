import { TestBed } from '@angular/core/testing';

import { HOR001Service } from './HOR001.service';

describe('HOR001Service', () => {
  let service: HOR001Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HOR001Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
