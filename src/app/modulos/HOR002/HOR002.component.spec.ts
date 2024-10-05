import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR002Component } from './HOR002.component';

describe('HOR002Component', () => {
  let component: HOR002Component;
  let fixture: ComponentFixture<HOR002Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR002Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR002Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
