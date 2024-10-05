import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GES00Component } from './GES00.component';

describe('GES00Component', () => {
  let component: GES00Component;
  let fixture: ComponentFixture<GES00Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GES00Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GES00Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
