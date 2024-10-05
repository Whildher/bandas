import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GES100Component } from './ges100.component';

describe('GES100Component', () => {
  let component: GES100Component;
  let fixture: ComponentFixture<GES100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GES100Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GES100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
