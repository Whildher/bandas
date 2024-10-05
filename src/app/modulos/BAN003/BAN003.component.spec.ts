import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BAN003Component } from './BAN003.component';

describe('BAN003Component', () => {
  let component: BAN003Component;
  let fixture: ComponentFixture<BAN003Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BAN003Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BAN003Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
