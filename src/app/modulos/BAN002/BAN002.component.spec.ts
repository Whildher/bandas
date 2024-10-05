import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BAN002Component } from './BAN002.component';

describe('BAN002Component', () => {
  let component: BAN002Component;
  let fixture: ComponentFixture<BAN002Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BAN002Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BAN002Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
