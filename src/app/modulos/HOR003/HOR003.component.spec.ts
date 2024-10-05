import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR003Component } from './HOR003.component';

describe('HOR003Component', () => {
  let component: HOR003Component;
  let fixture: ComponentFixture<HOR003Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR003Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR003Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
