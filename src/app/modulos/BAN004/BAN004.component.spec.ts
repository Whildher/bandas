import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BAN004Component } from './BAN004.component';

describe('BAN004Component', () => {
  let component: BAN004Component;
  let fixture: ComponentFixture<BAN004Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BAN004Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BAN004Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
