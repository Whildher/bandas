import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR00401Component } from './HOR00401.component';

describe('HOR00401Component', () => {
  let component: HOR00401Component;
  let fixture: ComponentFixture<HOR00401Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR00401Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR00401Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
