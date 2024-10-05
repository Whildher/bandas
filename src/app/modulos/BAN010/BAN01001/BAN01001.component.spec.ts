import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BAN01001Component } from './ban01001.component';

describe('BAN01001Component', () => {
  let component: BAN01001Component;
  let fixture: ComponentFixture<BAN01001Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BAN01001Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BAN01001Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
