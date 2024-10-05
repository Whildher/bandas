import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BAN005Component } from './ban005.component';

describe('BAN005Component', () => {
  let component: BAN005Component;
  let fixture: ComponentFixture<BAN005Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BAN005Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BAN005Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
