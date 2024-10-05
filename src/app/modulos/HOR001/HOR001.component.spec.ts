import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR001Component } from './HOR001.component';

describe('HOR001Component', () => {
  let component: HOR001Component;
  let fixture: ComponentFixture<HOR001Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR001Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR001Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
