import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR00503Component } from './HOR00503.component';

describe('HOR00503Component', () => {
  let component: HOR00503Component;
  let fixture: ComponentFixture<HOR00503Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR00503Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR00503Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
