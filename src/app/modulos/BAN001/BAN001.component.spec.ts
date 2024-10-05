import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BAN001Component } from './ban001.component';

describe('BAN001Component', () => {
  let component: BAN001Component;
  let fixture: ComponentFixture<BAN001Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BAN001Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BAN001Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
