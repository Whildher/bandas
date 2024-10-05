import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR00502Component } from './HOR00502.component';

describe('HOR00502Component', () => {
  let component: HOR00502Component;
  let fixture: ComponentFixture<HOR00502Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR00502Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR00502Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
