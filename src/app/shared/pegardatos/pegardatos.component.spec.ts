import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PegardatosComponent } from './pegardatos.component';

describe('PegardatosComponent', () => {
  let component: PegardatosComponent;
  let fixture: ComponentFixture<PegardatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PegardatosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PegardatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
