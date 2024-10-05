import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR00202Component } from './HOR00202.component';

describe('HOR00202Component', () => {
  let component: HOR00202Component;
  let fixture: ComponentFixture<HOR00202Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR00202Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR00202Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
