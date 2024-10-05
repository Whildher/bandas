import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR00501Component } from './HOR00501.component';

describe('HOR00501Component', () => {
  let component: HOR00501Component;
  let fixture: ComponentFixture<HOR00501Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR00501Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR00501Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
