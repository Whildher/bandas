import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BAN012Component } from './ban012.component';

describe('BAN012Component', () => {
  let component: BAN012Component;
  let fixture: ComponentFixture<BAN012Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BAN012Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BAN012Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
