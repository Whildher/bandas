import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BAN010Component } from './BAN010.component';

describe('BAN010Component', () => {
  let component: BAN010Component;
  let fixture: ComponentFixture<BAN010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BAN010Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BAN010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
