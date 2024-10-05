import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR00201Component } from './HOR00201.component';

describe('HOR00201Component', () => {
  let component: HOR00201Component;
  let fixture: ComponentFixture<HOR00201Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR00201Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR00201Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
