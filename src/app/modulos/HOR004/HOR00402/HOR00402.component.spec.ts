import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HOR00402Component } from './HOR00402.component';

describe('HOR00402Component', () => {
  let component: HOR00402Component;
  let fixture: ComponentFixture<HOR00402Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HOR00402Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HOR00402Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
