import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR004Component } from './HOR004.component';

describe('HOR004Component', () => {
  let component: HOR004Component;
  let fixture: ComponentFixture<HOR004Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR004Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR004Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
