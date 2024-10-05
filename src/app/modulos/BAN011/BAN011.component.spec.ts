import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BAN011Component } from './BAN011.component';

describe('BAN011Component', () => {
  let component: BAN011Component;
  let fixture: ComponentFixture<BAN011Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BAN011Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BAN011Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
