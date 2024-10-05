import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR00301Component } from './HOR00301.component';

describe('HOR00301Component', () => {
  let component: HOR00301Component;
  let fixture: ComponentFixture<HOR00301Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR00301Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR00301Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
