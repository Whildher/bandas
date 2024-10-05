import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR00101Component } from './HOR00101.component';

describe('HOR00101Component', () => {
  let component: HOR00101Component;
  let fixture: ComponentFixture<HOR00101Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR00101Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR00101Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
