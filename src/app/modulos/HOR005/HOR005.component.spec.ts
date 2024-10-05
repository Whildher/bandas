import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR005Component } from './hor005.component';

describe('HOR005Component', () => {
  let component: HOR005Component;
  let fixture: ComponentFixture<HOR005Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR005Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR005Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
